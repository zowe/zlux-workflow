

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

export interface ZosmfServerConfigWithMetadata {
  _metadataVersion: "1.1",
  _objectType: "com.rs.zosmf.workflows.zosmf.config",
  config: ZosmfServerConfig;
}

export interface ZosmfServerConfigResponse {
  _metadataVersion: "1.1"
  _objectType: "com.rs.config.resource"
  resource: "com.rs.zosmf.workflows/USER/zosmf" | "com.rs.zosmf.workflows/INSTANCE/zosmf"
  contents: ZosmfServerConfigWithMetadata
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

