

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import {WorkflowStepPluginAction, VariablesMap } from './workflow-step-plugin-action';
import { Workflow } from './workflow';
import { WorkflowVariable } from './workflow-variable';
import { Wizard } from './wizard';
import {logger} from './logger';

export class WorkflowStep {
  wizard: Wizard;
  'variable-references'?: any;
  name: string;
  specificAction?: WorkflowStepPluginAction;
  workflow: Workflow = null;
  variables: WorkflowVariable[] = [];
  state: string;
  submitAs: string;
  steps?: any[];
  level?: number;
  instructions?: string;
  templateSub?: string;
  instructionsSub?: string;
  saveAsUnixFileSub?: string;
  saveAsDatasetSub?: string;
  outPutSub?: string;
  outPut?: string;
  saveAsDataset?: string;
  saveAsUnixFile?: string;
  assignees?: string;
  hasPluginToRun?: boolean = false;
  performState?: string;
  returnCode?: string | any; // ???
  pinned?: boolean;

  constructor(jsonStep: any) {
    this.updateFromJson(jsonStep);
    this.processInstructions();
    this.wizard = new Wizard(this);
  }

  hasVariables(): boolean {
    return this['variable-references'] != null;
  }

  hasSpecificAction(): boolean {
    return this.specificAction != null;
  }

  getSpecificAction(): WorkflowStepPluginAction {
    return this.specificAction;
  }

  getInputMap(): VariablesMap {
    return this.specificAction.inputMap;
  }

  getOutputMap(): VariablesMap {
    return this.specificAction.outputMap;
  }

  updateFromJson(jsonStep: any): void {
    Object.assign(this, jsonStep);
  }

  processInstructions(): void {
    let specificActionJson,
      specificActionStartMarker = "${",
      specificActionEndMarker = "}$",
      markerLen = 2;
    if (this.instructions) {
      logger.info(`process instructions ${this.instructions}`);
      let specificActionStartPos = this.instructions.indexOf(specificActionStartMarker),
        specificActionEndPos = this.instructions.indexOf(specificActionEndMarker);
      if (specificActionStartPos >= 0 && specificActionEndPos > specificActionStartPos) {
        specificActionJson = JSON.parse(this.instructions.substring(specificActionStartPos + markerLen, specificActionEndPos));
        logger.info(`found a specific action for step ${this.name} with JSON ${specificActionJson}`);
        this.specificAction = new WorkflowStepPluginAction(specificActionJson);
        this.instructions = this.instructions.substring(0, specificActionStartPos) + this.instructions.substring(specificActionEndPos + markerLen);
      }
    }
  }

  isJclStep(): boolean {
    return this.submitAs === 'JCL';
  }

  isSimpleStep(): boolean {
    return this.submitAs == null;
  }

  isShellStep(): boolean {
    return this.submitAs === 'shell-JCL';
  }

  linkVariables(workflow: Workflow): void {
    let variableRefs = this["variable-references"];
    this.workflow = workflow;
    if (variableRefs) {
      for (let k = 0; k < variableRefs.length; k++) {
        var workflowVariable = workflow.getVariable(variableRefs[k].name);
        if (workflowVariable) {
          this.variables.push(workflowVariable);
        } else {
          logger.info(`workflow variable ${variableRefs[k].name} was not found`);
        }
      }
    }
  }

  isCompoundStep(): boolean {
    return Array.isArray(this.steps);
  }

  isAssignedToUser(userid: string): boolean {
    if (typeof this.assignees !== 'string') {
      return false;
    }
    const assigneesArray = this.assignees.toLowerCase().split(', ');
    return assigneesArray.includes(userid.toLowerCase());
  }

  isReady(): boolean {
    return this.state === 'Ready';
  }

  getNextWorkflowStep(): WorkflowStep | null {
    return this.workflow.getNextStep(this);
  }

}

export interface WorkflowStepStateFilter {
  [stepState:string]: boolean;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

