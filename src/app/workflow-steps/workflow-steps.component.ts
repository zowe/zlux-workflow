

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import {Component, EventEmitter, Input, OnInit, Output, HostBinding} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { logger } from '../shared/logger';
import { LoggerService } from './../shared/logger-service';
import { WorkflowStep,
   WorkflowStepStateFilter
  } from '../shared/workflow-step';
import { WorkflowStepAction,
   WorkflowStepActionType,
   WorkflowStepActionID
  } from '../shared/workflow-step-action';
import { Workflow } from '../shared/workflow';
import { ZosmfWorkflowService } from './../shared/zosmf-workflow-service';

@Component({
  selector: "workflow-steps",
  templateUrl: "workflow-steps.component.html",
  styleUrls: [
    "workflow-steps.component.css",
    "../css/workflow-common-styles.css"
  ],
  animations: [
    trigger("collapsed", [
      state(
        "yes",
        style({
          height: 0,
          overflow: "hidden",
          padding: 0
        })
      ),
      state(
        "no",
        style({
          height: "*"
        })
      ),
      transition("yes <=> no", animate("200ms linear"))
    ])
  ]
})
export class WorkflowStepsComponent implements OnInit {
  @Input() workflow: Workflow;
  @Input() userid: string;
  @Input() shownStates: string[] = [];
  @Input() stateFilter: WorkflowStepStateFilter = {};
  @Output() stepSelectedAction = new EventEmitter<WorkflowStepAction>();
  @Input() selectedStep: WorkflowStep;
  @Input() collapsed: string = "no";
  hoveredStep: WorkflowStep;
  hoveredWorkflow: Workflow;

  constructor(
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
    ) {}

  ngOnInit() {}

  startStep(stepAction: WorkflowStepAction): void {
    logger.info(`workflow-steps: start step ${stepAction.step.name}`);
    this.stepSelectedAction.emit(stepAction);
  }

  acceptStep(step: WorkflowStep): void {
    this.zosmfWorkflowService.acceptStep(step)
      .subscribe(
        () => logger.info(`step ${step.name} accepted`),
        (err) => this.loggerService.zosmfError(err)
      );
  }

  returnStep(step: WorkflowStep): void {
    this.zosmfWorkflowService.returnStep(step).subscribe(
      () => logger.info(`step ${step.name} returned`),
      (err) => this.loggerService.zosmfError(err)
    );
  }

  skipStep(step: WorkflowStep): void {
    this.zosmfWorkflowService.skipStep(step).subscribe(
      () => logger.info(`step ${step.name} skipped`),
      (err) => this.loggerService.zosmfError(err)
    );
  }

  overrideCompleteStep(step: WorkflowStep): void {
    this.zosmfWorkflowService.overrideCompleteStep(step).subscribe(
      () => logger.info('state of step ${step.name} changed to override complete'),
      (err) => this.loggerService.zosmfError(err)
    );
  }

  assignStep(step: WorkflowStep): void {
    alert('Implement me');
  }

  getStepIconClass(step: WorkflowStep | undefined): object {
    if (step) {
      return {
        'task-ready': step.state === 'Ready',
        'task-not-ready': step.state === 'Not Ready',
        'task-failed': step.state === 'Failed',
        'task-assigned': step.state === 'Assigned',
        'task-unassigned': step.state === 'Unassigned',
        'task-complete': step.state === 'Complete',
        'task-complete-override': step.state === 'Complete (Override)',
        'task-in-progress': step.state === 'In Progress',
        'task-submitted': step.state === 'Submitted',
        'task-skipped': step.state === 'Skipped'
      };
    }
    return null;
  }

  getAssignedSteps(): WorkflowStep[] {
    return this.workflow.steps.filter(step => step.isAssignedToUser(this.userid));
  }

  getShownSteps(): WorkflowStep[] {
    return this.getAssignedSteps().filter(step => this.stateFilter[step.state] || step.pinned);
  }

  getShownStepCount(): number {
    return this.getShownSteps().length;
  }

  getAssignedStepCount(): number {
    return this.getAssignedSteps().length;
  }

  getStepClass(step: WorkflowStep): object {
    const cssClass = {
      "step-active": this.selectedStep === step
    };
    return cssClass;
  }

  getStepCollapsedState(step: WorkflowStep): string {
    return this.getShownSteps().indexOf(step) >= 0 ? "no" : "yes";
  }

  toogle(): void {
    this.collapsed = this.collapsed === "yes" ? "no" : "yes";
    console.log("toogle", this.collapsed);
  }

  actionClick(step: WorkflowStep): void {
    if (
      ["Ready", "Failed", "Complete", "Submitted"].indexOf(step.state) !== -1
    ) {
      this.startStep(new WorkflowStepAction(WorkflowStepActionType.selectView, WorkflowStepActionID.general, step));
    } else if (step.state === "Assigned") {
      this.acceptStep(step);
    }
  }

  getActionLabel(step: WorkflowStep): string {
    if (
      ["Ready", "Failed", "Complete", "Submitted"].indexOf(step.state) !== -1
    ) {
      return "Check";
    } else if (step.state === "Ready") {
    } else if (step.state === "Assigned") {
      return "Accept";
    } else {
      return "";
    }
  }

  @HostBinding('hidden') get getHidden(): boolean {
    return this.getAssignedStepCount() < 1;
  }

  onStepHover(event: Event, step: WorkflowStep) {
    this.hoveredStep = step;
  }

  onWorkflowHover(event: Event, workflow: Workflow) {
    this.hoveredWorkflow = workflow;
  }

  performStep(step: WorkflowStep) {
    this.startStep(new WorkflowStepAction(WorkflowStepActionType.selectView,
      WorkflowStepActionID.perform, step));
  }

  checkStepStatus(step: WorkflowStep) {
    this.startStep(new WorkflowStepAction(WorkflowStepActionType.selectView,
      WorkflowStepActionID.status, step));
  }

  showStepInfo(step: WorkflowStep) {
    this.startStep(new WorkflowStepAction(WorkflowStepActionType.selectView,
      WorkflowStepActionID.general,
      step));
  }

  showAssignmentView(step: WorkflowStep) {
    this.startStep(new WorkflowStepAction(WorkflowStepActionType.selectView,
      WorkflowStepActionID.assignment,
      step));
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

