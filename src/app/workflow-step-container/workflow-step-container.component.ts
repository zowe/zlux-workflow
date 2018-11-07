/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import {
  AfterContentInit,
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepAction, WorkflowStepActionID, WorkflowStepSubActionID} from '../shared/workflow-step-action';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';
import 'rxjs/add/operator/do';
import { WorkflowStepPluginAction } from '../shared/workflow-step-plugin-action';
import { WorkflowStepAssignmentComponent } from '../workflow-step-assignment/workflow-step-assignment.component';


@Component({
  selector: "workflow-step-container",
  templateUrl: "./workflow-step-container.component.html",
  styleUrls: [
    "./workflow-step-container.component.css",
    "../css/workflow-common-styles.css"
  ],
  providers: []
})

export class WorkflowStepContainerComponent implements OnChanges {
  @Input() step: WorkflowStep;
  @Output() stepChangeRequested = new EventEmitter<WorkflowStepAction>();
  @ViewChild('workflowstepassignment')
  workflowStepAssignmentComponent: WorkflowStepAssignmentComponent;

  selectedView: string = 'perform';

  constructor(
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    logger.debug(`workflow-step-container changes=${changes}`)
  }

  onWorkflowStepPluginAction(stepAction: WorkflowStepPluginAction) {
    logger.debug(`workflow-step-container onWorkflowStepPluginAction=${stepAction.action}`)
  }

  mapActionToView(actionID: WorkflowStepActionID): string {
    switch (actionID) {
      case WorkflowStepActionID.properties:
      return 'properties';
      case WorkflowStepActionID.perform:
      return 'perform';
      case WorkflowStepActionID.status:
      return 'status';
      case WorkflowStepActionID.notes:
      return 'notes';
      default:
      return 'properties';
    }
  }

  processStepAction(stepAction: WorkflowStepAction): void {
    this.step = stepAction.step;
    this.selectedView = this.mapActionToView(stepAction.actionID);
    if (stepAction.subActionID === WorkflowStepSubActionID.assignment) {
      this.workflowStepAssignmentComponent.show();
    }
  }

  onStepChangeRequested(stepAction: WorkflowStepAction): void {
    this.processStepAction(stepAction);
    this.stepChangeRequested.emit(stepAction);
  }

  selectView(view: string): void {
    this.selectedView = view;
  }

  returnStep(): void {
    this.zosmfWorkflowService.returnStep(this.step).subscribe(
      () => {
        logger.info(`step ${this.step.name} returned`);
        this.selectView('properties');
      },
      (err) => this.loggerService.zosmfError(err)
    );
  }

  skipStep(): void {
    this.zosmfWorkflowService.skipStep(this.step).subscribe(
      () => {
        logger.info(`step ${this.step.name} skipped`);
        this.selectView('properties');
      },
      (err) => this.loggerService.zosmfError(err)
    );
  }

  overrideCompleteStep(): void {
    this.zosmfWorkflowService.overrideCompleteStep(this.step).subscribe(
      () => {
        logger.info('state of step ${step.name} changed to override complete');
        this.selectView('properties');
      },
      (err) => this.loggerService.zosmfError(err)
    );
  }

  showAssignmentDialog() {
    this.selectView('properties');
    this.workflowStepAssignmentComponent.show();
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
