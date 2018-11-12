

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { WorkflowStep } from "./workflow-step";
import { WizardStep, WizardStepType } from "./wizard-step";
import {JobStatus, JobFile } from './zosmf-workflow-service';
import {logger} from './logger';

export class Wizard {
  private finished: boolean = false;
  currentWizardStepIndex: number;
  currentWizardStep: WizardStep;
  newStepState: string;
  performJobfiles: JobFile[];
  performJobstatus: JobStatus;
  performDefinitions: string;
  performTemplate: string;
  wizardSteps: WizardStep[];
  pluginToRun?: string;
  pluginToRunParameters?: any;
  fileContents?: string;
  fileContentsForEditor?: string;

  jobCards: string = '';

  constructor(public workflowStep: WorkflowStep) {
    if (workflowStep.isSimpleStep()) {
      if (workflowStep.hasVariables()) {
        this.wizardSteps = [
          new WizardStep(WizardStepType.STEP_TYPE_INPUT_VARIABLES, "Input Variables"),
          new WizardStep(WizardStepType.STEP_TYPE_INSTRUCTIONS, "Instructions")
        ];
      } else {
        this.wizardSteps = [
          new WizardStep(WizardStepType.STEP_TYPE_INSTRUCTIONS, "Instructions")
        ];
      }
    } else if (workflowStep.isJclStep()) {
      if (workflowStep.hasVariables()) {
        this.wizardSteps = [
          new WizardStep(WizardStepType.STEP_TYPE_INPUT_VARIABLES, "Input Variables"),
          new WizardStep(WizardStepType.STEP_TYPE_INSTRUCTIONS, "Instructions"),
          new WizardStep(WizardStepType.STEP_TYPE_EXECUTION_OF_JCL, "Execution of JCL"),
          new WizardStep(WizardStepType.STEP_TYPE_VIEW_OUTPUT, "View Output")
        ];
      } else {
        this.wizardSteps = [
          new WizardStep(WizardStepType.STEP_TYPE_INSTRUCTIONS, "Instructions"),
          new WizardStep(WizardStepType.STEP_TYPE_EXECUTION_OF_JCL, "Execution of JCL"),
          new WizardStep(WizardStepType.STEP_TYPE_VIEW_OUTPUT, "View Output")
        ];
      }
    } else {
      logger.warn("Unknown wizard type");
      this.wizardSteps = [
          new WizardStep(WizardStepType.STEP_TYPE_INSTRUCTIONS, "Instructions")
      ]; // TODO: HACK
    }
    this.reset();
  }

  reset(): void {
    for (let step of this.wizardSteps) {
      step.reset();
    }
    this.performTemplate = null;
    this.performDefinitions = null;
    this.performJobstatus = null;
    this.performJobfiles = null;
    this.newStepState = null;
    this.finished = false;
    this.currentWizardStepIndex = 0;
    this.currentWizardStep = this.wizardSteps[this.currentWizardStepIndex];
    this.currentWizardStep.activate();
  }

  isFinished(): boolean {
    return this.finished;
  }

  nextStep(): void {
    this.currentWizardStep.complete();
    if (this.currentWizardStepIndex + 1 < this.wizardSteps.length) {
      this.currentWizardStepIndex++;
      this.currentWizardStep = this.wizardSteps[this.currentWizardStepIndex];
      this.currentWizardStep.activate();
    } else {
      this.finished = true;
    }
  }

  checkStatus(): void {
    this.performTemplate = null;
    this.performDefinitions = null;
    this.performJobstatus = null;
    this.performJobfiles = null;
    this.newStepState = null;
    this.finished = true;
    for (let step of this.wizardSteps) {
      step.complete();
    }
    this.currentWizardStepIndex = this.wizardSteps.length - 1;
    this.currentWizardStep = this.wizardSteps[this.currentWizardStepIndex];
  }

  canBeFinished(): boolean {
    const workflowStep = this.workflowStep;
    return (workflowStep.isSimpleStep() && this.currentWizardStep.type === WizardStepType.STEP_TYPE_INSTRUCTIONS) ||
    (workflowStep.isJclStep() && this.currentWizardStep.type === WizardStepType.STEP_TYPE_EXECUTION_OF_JCL);
  }

  updateFileContents(): void {
    if (this.jobCards.endsWith('\n')) {
      this.fileContents = this.jobCards + this.performTemplate;
    } else {
      this.fileContents = this.jobCards + '\n' + this.performTemplate;
    }
    this.fileContentsForEditor = this.fileContents;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

