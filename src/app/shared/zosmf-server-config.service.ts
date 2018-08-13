

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {Injectable, Inject, ViewChild} from '@angular/core';
import {Http} from '@angular/http';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';
import {
  Angular2InjectionTokens,
  Angular2PluginViewportEvents
  } from 'pluginlib/inject-resources';

import {ZluxPopupManagerService, ZluxErrorSeverity } from '@zlux/widgets';
import {ZosmfServerConfig, ZosmfServerConfigWithMetadata, ZosmfServerConfigResponse, ZosmfServer} from './zosmf-server-config';

@Injectable()
export class ZosmfServerConfigService {

  private readonly uri;
  private cachedConfig: ZosmfServerConfig;
  private storageKey: string = 'com.rs.zosmf.workflows.zosmf.server.config';


  constructor(
    @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition,   
    private http: Http, 
    private popupManager: ZluxPopupManagerService)
  {
    popupManager.setLogger(logger);
    this.cachedConfig = this.getLocalConfig();
    this.uri = RocketMVD.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(),'user', 'zosmf', 'server-config')
  }
  
  getLocalConfig(): ZosmfServerConfig {
    let config: ZosmfServerConfig = null;
    try {
      config = JSON.parse(localStorage.getItem(this.storageKey));
    } catch(e) {
      localStorage.removeItem(this.storageKey);
    }
    if (!!config && !!config.defaultZosmfServer) {
      return config;
    }
    return null;
  }
  
  getConfig(): Promise<ZosmfServerConfig> {
    return this.http.get(this.uri)
      .map(res => res.json())
      .map((res: ZosmfServerConfigResponse) => {
        this.cachedConfig = res.contents.config;
        return res.contents.config;
      })
      .toPromise()
  }

  getCachedConfig(): ZosmfServerConfig | null {
    return this.cachedConfig;
  }

  saveConfig(serverConfig: ZosmfServerConfig): Promise<any> {
    serverConfig.zosmfServers = serverConfig.zosmfServers.filter(server => !!server.host && !!server.port);
    const configWithMatadata: ZosmfServerConfigWithMetadata = {
      _metadataVersion: "1.1",
      _objectType: "com.rs.zosmf.workflows.zosmf.config",
      config: serverConfig
    };
    this.cachedConfig = serverConfig;
    localStorage.setItem(this.storageKey, JSON.stringify(serverConfig));
    return this.http.put(this.uri, JSON.stringify(configWithMatadata)).toPromise()
    .catch(err => {
      
    let errorTitle: string = "Error";
    let errorMessage: string = "Server configuration save failed.";
    const options = {
      blocking: true
    };
      this.popupManager.reportError(ZluxErrorSeverity.ERROR, errorTitle.toString()+": "+err.status.toString(), errorMessage+"\n"+err.toString(), options);  
    });
  }
  
  get configured(): boolean {
    return !!this.cachedConfig && !!this.cachedConfig.defaultZosmfServer;
  }
  
  get defaultZosmfServer(): ZosmfServer {
    return this.cachedConfig.defaultZosmfServer;
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

