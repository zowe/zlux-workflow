

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
import {WorkflowStep, WorkflowStepStateFilter} from '../shared/workflow-step';
import {Workflow} from '../shared/workflow';
import {logger} from '../shared/logger';

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
  @Output() stepSelected = new EventEmitter<WorkflowStep>();
  @Input() selectedStep: WorkflowStep;
  @Input() collapsed: string = "no";
  hoveredStep: WorkflowStep;
  hoveredWorkflow: Workflow;

  private actions: {
    [state: string]: {
      title: string,
      click: (step: WorkflowStep) => void
    }
  } = {
    Ready: {
      title: 'Perform',
      click: (step: WorkflowStep) => this.startStep(step)
    },
    Failed: {
      title: 'Check',
      click: (step: WorkflowStep) => this.startStep(step)
    },
    Complete: {
      title: 'Check',
      click: (step: WorkflowStep) => this.startStep(step)
    },
    Submitted: {
      title: 'Check',
      click: (step: WorkflowStep) => this.startStep(step)
    },
    Assigned: {
      title: 'Accept',
      click: (step: WorkflowStep) => this.acceptStep(step)
    },
    'Not Ready': {
      title: 'Assign',
      click: (step: WorkflowStep) => this.assignStep(step)
    },
    'In Progress': {
      title: 'Check',
      click: (step: WorkflowStep) => {}
    },
    'Skipped': {
      title: 'Check',
      click: (step: WorkflowStep) => {}
    },
    'Unassigned': {
      title: 'Assign',
      click: (step: WorkflowStep) => {}
    },
    'Complete (Override)': {
      title: 'Check',
      click: (step: WorkflowStep) => {}
    }
  };

  constructor() {}

  ngOnInit() {}

  startStep(step: WorkflowStep): void {
    logger.info(`start step ${step.name}`);
    this.stepSelected.emit(step);
  }

  acceptStep(step: WorkflowStep): void {
    alert('Implement me');
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
      this.startStep(step);
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

  getStepActionTitle(step: WorkflowStep): string {
    const action = this.actions[step.state];
    if (action) {
      return action.title;
    } else {
      logger.warn(`Unknown step state ${step.state}`);
      return null;
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
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

