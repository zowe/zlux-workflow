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
  SimpleChanges
} from '@angular/core';
import {
  Angular2InjectionTokens,
  } from 'pluginlib/inject-resources';
import { logger } from '../shared/logger';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from '../shared/logger-service';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepAction, WorkflowStepActionID} from '../shared/workflow-step-action';
import { ZosmfLoginService } from '../shared/zosmf-login.service';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';
import 'rxjs/add/operator/do';
import { WorkflowStepPluginAction } from '../shared/workflow-step-plugin-action';


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

  selectedView: string = 'perform';
  enabledViews: string[] = ['perform', 'general', 'status', 'assignment'];

  ngOnInit(): void {

  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    logger.debug(`workflow-step-container changes=${changes}`)
  }

  isDisabled(view: string): boolean {
    return !this.enabledViews.includes(view);
  }

  onWorkflowStepPluginAction(stepAction: WorkflowStepPluginAction) {
    logger.debug(`workflow-step-container onWorkflowStepPluginAction=${stepAction.action}`)
  }

  mapActionToView(actionID: WorkflowStepActionID): string {
    switch (actionID) {
      case WorkflowStepActionID.details:
      return 'details';
      case WorkflowStepActionID.general:
      return 'general';
      case WorkflowStepActionID.perform:
      return 'perform';
      case WorkflowStepActionID.status:
      return 'status';
      case WorkflowStepActionID.assignment:
      return 'assignment';
      default:
      return 'general';
    }
  }

  processStepAction(stepAction: WorkflowStepAction): void {
    this.step = stepAction.step;
    this.selectedView = this.mapActionToView(stepAction.actionID);
  }

  onStepChangeRequested(stepAction: WorkflowStepAction): void {
    this.processStepAction(stepAction);
    this.stepChangeRequested.emit(stepAction);
  }
}
