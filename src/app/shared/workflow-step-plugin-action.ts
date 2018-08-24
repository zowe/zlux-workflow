
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export class WorkflowStepPluginAction {
  action: 'embedPlugin' | 'runPlugin';
  pluginIdentifier: string;
  inputMap?: VariablesMap;
  outputMap?: VariablesMap;

  constructor(jsonAction: any) {
    this.updateFromJson(jsonAction);
  }

  updateFromJson(jsonAction: any): void {
    Object.assign(this, jsonAction);
  }
}

export type VariablesMap = {[workflowVariable: string]: string};

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
