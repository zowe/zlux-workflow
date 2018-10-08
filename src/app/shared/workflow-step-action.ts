

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { WorkflowStep } from "./workflow-step";

export enum WorkflowStepActionType {
  selectView,
  modifyStep
}

export enum WorkflowStepActionID {
  properties,
  perform,
  status,
  details
}

export enum WorkflowStepSubActionID {
  assignment
}

export interface WorkflowStepAction {
  actionType: WorkflowStepActionType;
  actionID: WorkflowStepActionID;
  step: WorkflowStep;
  subActionID?: WorkflowStepSubActionID;
};

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

