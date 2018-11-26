

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


export enum WizardStepType {
  STEP_TYPE_INPUT_VARIABLES = 1,
  STEP_TYPE_INSTRUCTIONS,
  STEP_TYPE_EXECUTION_OF_JCL,
  STEP_TYPE_VIEW_OUTPUT
}

enum WizardStepState {
  STEP_STATE_NOT_COMPLETED,
  STEP_STATE_IN_PROGRESS,
  STEP_STATE_COMPLETED
}

export class WizardStep {
  type: WizardStepType;
  state: WizardStepState;
  text: string;

  constructor(type: WizardStepType, text: string) {
    this.type = type;
    this.text = text;
    this.state = WizardStepState.STEP_STATE_NOT_COMPLETED;
  }

  isCompleted(): boolean {
    return this.state === WizardStepState.STEP_STATE_COMPLETED;
  }

  isInProgress(): boolean {
    return this.state === WizardStepState.STEP_STATE_IN_PROGRESS;
  }

  activate(): void {
    this.state = WizardStepState.STEP_STATE_IN_PROGRESS;
  }

  reset(): void {
    this.state = WizardStepState.STEP_STATE_NOT_COMPLETED;
  }

  complete(): void {
    this.state = WizardStepState.STEP_STATE_COMPLETED;
  }

}



/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

