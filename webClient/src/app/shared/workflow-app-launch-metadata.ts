

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export type WorkflowAppLaunchMetadataAction = "startWorkflow";

export interface WorkflowAppLaunchMetadata {
  action: "startWorkflow";
  actionData: WorkflowCreationAction;
  actionOptions?: WorkflowCreationActionOptions;
}

export interface WorkflowCreationAction {
  workflowName: string;
  workflowDefinitionFile: string;
  variableInputFile?: string;
  variables?: WorkflowVariableData[];
  "resolveGlobalConflictBy Using"?: "input"| "global";
  system: string;
  owner: string;
  comments?: string;
  assignToOwner?: boolean;
  accessType?: "Public" | "Restricted" | "Private";
  accountInfo?: string;
  jobStatement?: string;
  deleteCompletedJobs?: boolean;
}

export interface WorkflowVariableData {
  name: string;
  value: string;
}

export interface WorkflowCreationActionOptions {
  setOwnerToCurrentUser?: boolean;
}

export interface WorkflowCreationResponse {
  vendor: string,
  workflowDescription: string,
  workflowID: string,
  workflowKey: string,
  workflowVersion: string
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

