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
  Inject,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  Angular2InjectionTokens,
  } from 'pluginlib/inject-resources';
import { logger } from '../shared/logger';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from '../shared/logger-service';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepAction, WorkflowStepActionID, WorkflowStepSubActionID} from '../shared/workflow-step-action';
import { ZosmfLoginService } from '../shared/zosmf-login.service';
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

export class WorkflowStepContainerComponent
  implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
  @Input() step: WorkflowStep;
  @Output() stepChangeRequested = new EventEmitter<WorkflowStepAction>();
  @ViewChild('workflowstepassignment')
  workflowStepAssignmentComponent: WorkflowStepAssignmentComponent;

  selectedView: string = 'perform';

  ngOnInit(): void {

  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

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
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
