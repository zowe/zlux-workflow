

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export interface ZosmfServerConfig {
  defaultZosmfServer: ZosmfServer,
  zosmfServers: ZosmfServer[];
}

export interface ZosmfServer {
  host: string;
  port: number;
}

//TODO ideally  _objectType would be directly derived from the pluginDefinition
export interface ZosmfServerConfigWithMetadata {
  _metadataVersion: "1.1",
  _objectType: "org.zowe.zosmf.workflows.zosmf.config",
  config: ZosmfServerConfig;
}

//TODO is this really helpful? It assumes certain strings, such as version.
export interface ZosmfServerConfigResponse {
  _metadataVersion: "1.1"
  _objectType: "org.zowe.configjs.resource"
  resource: "org.zowe.zosmf.workflows/USER/zosmf" | "org.zowe.zosmf.workflows/INSTANCE/zosmf"
  contents: ZosmfServerConfigWithMetadata
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

