

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
  general,
  perform,
  status,
  details,
  assignment
}

export enum WorkflowStepSubActionID {
  assignment
}

export class WorkflowStepAction {

  constructor(readonly actionType: WorkflowStepActionType,
              readonly actionID: WorkflowStepActionID,
              readonly step: WorkflowStep,
              readonly subActionID?: WorkflowStepSubActionID) {
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

