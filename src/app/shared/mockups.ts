

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { ViewContainerRef } from '@angular/core';
import {Angular2PluginEmbedActions, InstanceId} from 'pluginlib/inject-resources';
import {WorkflowAppLaunchMetadata} from './workflow-app-launch-metadata';

export const launchMetadataStub: WorkflowAppLaunchMetadata = {
  action: "startWorkflow",
  actionData: {
  workflowName: "Handle Storage Shortage - Workflow Test",
//  workflowDefinitionFile: "/u/pdpenn/mvd/demo1/workflows/storyboard.xml",
  workflowDefinitionFile: "/u/tslvc/test_jcl.xml",
  variables: [],
  system: "RS41",
  owner: null,
  assignToOwner: true
  },
  actionOptions: {
    setOwnerToCurrentUser: true
  }
};

export const embedActionsStub: Angular2PluginEmbedActions = {
  createEmbeddedInstance(identifier: string, launchMetadata: any, viewContainer: ViewContainerRef): Promise<InstanceId> {
    return new Promise(null);
  }
};


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

