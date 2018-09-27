
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
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
  } from '@angular/core';
import {
  Angular2InjectionTokens,
  Angular2PluginEmbedActions,
  EmbeddedInstance
  } from 'pluginlib/inject-resources';
import {
  DomSanitizer,
  SafeHtml
  } from '@angular/platform-browser';
import { logger } from '../shared/logger';
import { Observable } from 'rxjs/Observable';
import { WizardStepType } from '../shared/wizard-step';
import { Workflow } from '../shared/workflow';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepAction, WorkflowStepActionID, WorkflowStepActionType } from '../shared/workflow-step-action';
import { WorkflowStepPluginAction } from '../shared/workflow-step-plugin-action';
import { WorkflowVariable } from '../shared/workflow-variable';
import { LoggerService } from '../shared/logger-service';
import { ZosmfLoginService } from '../shared/zosmf-login.service';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';
import { WorkflowStepStatusComponent} from '../workflow-step-status/workflow-step-status.component';
import 'rxjs/add/operator/do';
import '../images/check-green.svg';


@Component({
  selector: "workflow-step-wizard",
  templateUrl: "./workflow-step-wizard.component.html",
  styleUrls: [
    "./workflow-step-wizard.component.css",
    "../css/workflow-common-styles.css"
  ],
  providers: []
})

export class WorkflowStepWizardComponent
  implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
  @Input() step: WorkflowStep;
  @Output() completed = new EventEmitter();
  @Output() stepChangeRequested = new EventEmitter<WorkflowStepAction>();
  @ViewChild('embeddedwindow', { read: ViewContainerRef })  viewContainerRef: ViewContainerRef;
  @ViewChild('jcltextarea') jclTextArea: ElementRef;
  @ViewChild('workflowstepstatus') workflowStepStatusComponent: WorkflowStepStatusComponent;

  private initialized: boolean = false;
  public wizardStepTypes = WizardStepType;
  private embeddedInstance: EmbeddedInstance;
  activeTabKey = null;
  isWizardVeilEnabled = false;
  isJCLEditable = false;
  private nextWorkflowStep: WorkflowStep = null;
  private applicationManager: MVDHosting.ApplicationManagerInterface;

  constructor(
    private sanitizer: DomSanitizer,
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService,
    @Optional()
    @Inject(Angular2InjectionTokens.PLUGIN_EMBED_ACTIONS)
    private embedActions: Angular2PluginEmbedActions,
    private injector: Injector,
    private loginService: ZosmfLoginService
  ) {
    this.applicationManager = injector.get(MVDHosting.Tokens.ApplicationManagerToken);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    logger.debug(
      `ngAfterViewInit step ${this.step} initialized ${this.initialized}`
    );
  }

  ngAfterContentInit(): void {
    logger.debug(
      `ngAfterContentInit step ${this.step} initialized ${this.initialized}`
    );
    if (this.step) {
      this.start();
    }
    this.initialized = true;
  }

  getInstructionsSafely(): SafeHtml | null {
    if (this.step.instructions) {
      return this.sanitizer.bypassSecurityTrustHtml(this.step.instructions);
    }
    return null;
  }

  next(): void {
    const currentWizardStep = this.step.wizard.currentWizardStep;
    this.showVeil();
    switch (currentWizardStep.type) {
      case WizardStepType.STEP_TYPE_INPUT_VARIABLES:
        this.endInputVariablesStep()
        .finally(() => this.hideVeil())
        .subscribe(
          () => {
            if (this.nextStep()) {
              this.startCurrentStep();
            }
          },
          err => this.loggerService.zosmfError(err)
        );
        break;
      case WizardStepType.STEP_TYPE_INSTRUCTIONS:
        this.endInstructionsStep()
        .finally(() => this.hideVeil())
        .subscribe(
          () => {
            if (this.nextStep()) {
              this.startCurrentStep();
            }
          },
          err => this.loggerService.zosmfError(err)
        );
        break;
      case WizardStepType.STEP_TYPE_EXECUTION_OF_JCL:
        this.submitAndGetJobStatusWithFiles()
        .finally(() => this.hideVeil())
        .subscribe(
          () => {
            if (this.nextStep()) {
              this.startCurrentStep();
            }
          },
          err => this.loggerService.zosmfError(err)
        );
        break;
      case WizardStepType.STEP_TYPE_VIEW_OUTPUT:
        this.hideVeil()
        if (this.nextStep()) {
          this.startCurrentStep();
        }
        break;
      default:
        this.hideVeil();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    logger.debug(`ngOnChanges initialized ${this.initialized}`);
    if (this.initialized) {
      const stepChange = changes["step"];
      if (stepChange) {
        this.start();
      }
    }
  }

  finishSimpleStep(): Observable<any> {
    return this.zosmfWorkflowService.saveVariablesAndFinishSimpleStep(this.step).mergeMap(() => this.updateWorkflowAndShowNotification());
  }

  updateWorkflow(): Observable<any> {
    return this.zosmfWorkflowService.updateWorkflow(this.step.workflow).map(
      () => {
        logger.info('workflow updated');
        this.completed.emit();
      });
  }

  updateWorkflowAndShowNotification(): Observable<any> {
    return this.zosmfWorkflowService.updateWorkflow(this.step.workflow).map(
      () => {
        logger.info('workflow updated');
        this.completed.emit();
        this.workflowStepStatusComponent.updateJobStatus()
      });
  }

  nextStep(): boolean {
    this.step.wizard.nextStep();
    return !this.step.wizard.isFinished();
  }

  submitAndGetJobStatusWithFiles(): Observable<any> {
    this.workflowStepStatusComponent.step = this.step;
    return this.zosmfWorkflowService
      .submitJob(this.step)
      .mergeMap(() => this.workflowStepStatusComponent.getJobStatusWithFiles())
      .mergeMap(() => this.updateWorkflowAndShowNotification());
  }

  startInstuctionsStep(): void {
    if (this.step.hasSpecificAction()) {
      const action = this.step.getSpecificAction();
      if (action.action === "embedPlugin") {
        this.embedPlugin(action);
      } else if (action.action === "runPlugin") {
        this.preparePluginToRun(action);
      }
    }
  }

  startViewOutputStep(): void {
    // nothing to do here
    this.nextStep();
  }

  endInstructionsStep(): Observable<any> {
    if (this.step.isJclStep()) {
      return this.zosmfWorkflowService.getJobStatementAndSubstituteVariablesIntoTemplates(this.step);
    } else {
      return this.finishSimpleStep();
    }
  }

  endInputVariablesStep(): Observable<any> {
    return this.zosmfWorkflowService.substituteVariablesIntoTemplates(this.step);
  }

  embedPlugin(action: WorkflowStepPluginAction): void {
    if (this.embedActions) {
      logger.info(
        `about to embed ${action.pluginIdentifier} into viewContainerRef ${
          this.viewContainerRef
        }`
      );
      this.embedActions
        .createEmbeddedInstance(
          action.pluginIdentifier,
          null,
          this.viewContainerRef
        )
        .then(embeddedPlugin => {
          this.embeddedInstance = embeddedPlugin;
          this.setEmbeddedInstanceInputs();
          this.subscribeToEmbeddedInstanceOutputs();
        })
        .catch(e => {
          logger.info(
            `couldn't embed plugin ${action.pluginIdentifier} because ${e}`
          );
        });
    }
  }

  unembedPlugin(): void {
    if (this.hasEmbeddedPlugin()) {
      this.viewContainerRef.clear(); // TODO: Use API for un-embedding when it is ready
      this.embeddedInstance = null;
    }
  }

  hasEmbeddedPlugin(): boolean {
    return !!this.embeddedInstance;
  }

  preparePluginToRun(action: WorkflowStepPluginAction): void {
    this.step.hasPluginToRun = true;
  }

  start(): void {
    const step = this.step;
    this.step.pinned = true;
    this.nextWorkflowStep = step.getNextWorkflowStep();
    this.unembedPlugin();
    this.isJCLEditable = false;
    if (step.state === 'Submitted' ||
      step.state === 'Complete' ||
      step.state === 'Failed') {
      this.checkStep();
    } else {
      step.wizard.reset();
      this.startCurrentStep();
    }
  }

  startCurrentStep(): void {
    const currentWizardStep = this.step.wizard.currentWizardStep;
    logger.debug(`startCurrentStep type ${currentWizardStep.type}`);
    this.hideVeil();
    if (currentWizardStep.type === WizardStepType.STEP_TYPE_INSTRUCTIONS) {
      this.startInstuctionsStep();
    } else if (currentWizardStep.type === WizardStepType.STEP_TYPE_VIEW_OUTPUT) {
      this.workflowStepStatusComponent.getJobStatusWithFiles();
      this.startViewOutputStep();
    }
  }

  checkStep(): void {
    this.step.wizard.checkStatus();
    if (this.step.isJclStep()) {
      this.showVeil();
      this.workflowStepStatusComponent.step = this.step;
      this.workflowStepStatusComponent.getJobStatusWithFiles()
        .finally(() => this.hideVeil())
        .subscribe(
          _ => this.startCurrentStep(),
          err => this.loggerService.zosmfError(err)
        );
    } else {
      this.startCurrentStep();
    }
  }

  keys(o: object): any[] {
    if (o) {
      return Object.keys(o);
    } else {
      return [];
    }
  }

  onSpoolFileClick(event: Event): void {
    event.preventDefault();
  }

  startNextWorkflowStep(): void {
    this.stepChangeRequested.emit({
      actionType: WorkflowStepActionType.selectView,
      actionID:  WorkflowStepActionID.perform,
      step: this.nextWorkflowStep
    });
  }

  isNextWorkflowStepReady(): boolean {
    const workflow = this.step.workflow;
    const nextWorkflowStep = this.nextWorkflowStep;
    return nextWorkflowStep != null
      && nextWorkflowStep.isAssignedToUser(this.loginService.userid)
      && nextWorkflowStep.isReady();
  }


  setEmbeddedInstanceInputs(): void {
    const inputMap = this.step.getInputMap();
    for (let workflowVarName in inputMap) {
      const workflowVar = this.step.workflow.getVariable(workflowVarName);
      if (workflowVar === undefined) {
        logger.info(`workflow variable '${workflowVarName}' was not found`);
        continue;
      }
      if (workflowVar.value === null) {
        logger.info(`no value for workflow variable '${workflowVarName}'`);
        continue;
      }
      const inputName = inputMap[workflowVarName];
      logger.info(
        `about to set input '${inputName}' to value '${workflowVar.value}'`
      );
      if (workflowVar.type === "number") {
        this.applicationManager.setEmbeddedInstanceInput(
          this.embeddedInstance,
          inputName,
          +workflowVar.value
        );
      } else {
        this.applicationManager.setEmbeddedInstanceInput(
          this.embeddedInstance,
          inputName,
          workflowVar.value
        );
      }
    }
  }

  subscribeToEmbeddedInstanceOutputs(): void {
    const outputMap = this.step.getOutputMap();
    for (let workflowVarName in outputMap) {
      const workflowVar = this.step.workflow.getVariable(workflowVarName);
      if (workflowVar === undefined) {
        logger.info(`workflow variable '${workflowVarName}' was not found`);
        continue;
      }
      const outputName = outputMap[workflowVarName];
      const output = this.applicationManager.getEmbeddedInstanceOutput(
        this.embeddedInstance,
        outputName
      );
      if (output === undefined) {
        logger.info(`component output '${outputName}' was not found`);
        continue;
      }
      logger.info(`about to subscribe to component output '${outputName}'`);
      this.subscribeToOutput(workflowVar, output);
    }
  }

  subscribeToOutput(
    workflowVar: WorkflowVariable,
    output: Observable<any>
  ): void {
    output.subscribe((value: any) => {
      if (value !== undefined) {
        logger.info(
          `emitted new value '${value}' for workflow variable '${
            workflowVar.name
          }', previous value '${workflowVar.value}'`
        );
        workflowVar.value = `${value}`;
      }
    });
  }

  private showVeil(): void {
    this.isWizardVeilEnabled = true;
  }

  private hideVeil(): void {
    this.isWizardVeilEnabled = false;
  }

  editOrSaveJCL(): void {
    this.isJCLEditable = !this.isJCLEditable;
    if (this.isJCLEditable) {
      this.step.wizard.fileContentsForEditor = this.step.wizard.fileContents;
      setTimeout(_ => this.jclTextArea.nativeElement.focus(), 0);
    } else {
      this.step.wizard.fileContents = this.step.wizard.fileContentsForEditor;
    }
  }

  discardJCL(): void {
    this.isJCLEditable = false;
    this.step.wizard.fileContentsForEditor = this.step.wizard.fileContents;
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

