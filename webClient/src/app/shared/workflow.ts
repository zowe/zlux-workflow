

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {WorkflowStep} from './workflow-step';
import {WorkflowVariable} from './workflow-variable';
import {logger} from './logger';

export class Workflow {
  workflowKey: string;
  variables: WorkflowVariable[];
  steps: WorkflowStep[];
  statusName: string;
  percentComplete: number;
  collapsed?: boolean;
  workflowName: string;
  workflowDescription: string;

  private allSteps: WorkflowStep[] = [];

  constructor(jsonWorkflow: any) {
    this.updateFromJson(jsonWorkflow);
    this.linkVariablesToSteps(this.steps);
  }

  updateFromJson(jsonWorkflow: any): void {
    Object.assign(this, jsonWorkflow);
  }

  getVariable(name: string): WorkflowVariable | undefined {
    return this.variables.filter((v) => v.name === name)[0];
  }

  setVariable(name: string, value: string): void {
    const [variable] = this.variables.filter((v) => v.name === name);
    if (variable) {
      logger.info(`about to set workflow variable ${variable.name} of type ${variable.type} to ${value}`);
      if (variable.type === 'number') {
        if (isFinite(parseFloat(value))) {
          variable.value = value;
        } else {
          logger.info(`discard workflow variable ${variable.name} to because it is not a finite number ${value}`);
        }
      } else {
        variable.value = value;
      }
    } else {
      logger.info(`workflow variable ${name} not found`);
    }
  }


  linkVariablesToSteps(steps: any[]): void {
    const workflowSteps: WorkflowStep[] = [];
    for (let j = 0; j < steps.length; j++) {
      const workflowStep = new WorkflowStep(steps[j]);
      workflowSteps.push(workflowStep);
      workflowStep.linkVariables(this);
      steps[j] = workflowStep;
      if (Array.isArray(workflowStep.steps)) {
        this.linkVariablesToSteps(workflowStep.steps);
      }
    }
  }

  getAllStepsAsArray(): WorkflowStep[] {
    if (this.allSteps.length === 0) {
      const result = this.getAllStepsAsArrayAtLevel(this.steps, 0);
      this.allSteps = result;
    }
    return this.allSteps;
  }

  private getAllStepsAsArrayAtLevel(steps: WorkflowStep[], level: number): WorkflowStep[] {
    let resultSteps: WorkflowStep[] = [];
    for (let step of steps) {
      step.level = level;
      resultSteps.push(step);
      if (step.isCompoundStep() && level < 1) {
        resultSteps = resultSteps.concat(this.getAllStepsAsArrayAtLevel(step.steps, level + 1));
      }
    }
    return resultSteps;
  }

  getNextStep(currentStep: WorkflowStep): WorkflowStep {
    const currentStepIndex = this.steps.indexOf(currentStep);
    if (currentStepIndex >= 0 && currentStepIndex < this.steps.length - 1) {
      return this.steps[currentStepIndex + 1];
    }
    return null;
  }

  isCompleted(): boolean {
    return this.percentComplete === 100;
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

