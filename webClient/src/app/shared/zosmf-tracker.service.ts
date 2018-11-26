

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';

import {logger} from './logger';

@Injectable()
export class ZosmfTrackerService {
  private uri: string;

  constructor(private http: Http,
  @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition) {
    this.uri = ZoweZLUX.uriBroker.pluginRESTUri(this.pluginDefinition.getBasePlugin(), "zosmftracker", "");
  }

  testConnection(host: string, port: number): Promise<ServerStatus> {
    if (!!host && !!port) {
      return this.http.get(`${this.uri}?host=${host}&port=${port}`)
        .do(res => logger.debug(`test connection to ${host}:${port} ${res.status} ${res.statusText} ${res.text()}`))
        .map(res => res.json() as ZosmfTrackerServiceResponse)
        .map(res => res.online ? 'online' : 'offline')
        .catch(_ => Observable.of('unknown' as ServerStatus))
        .toPromise();
    } else {
      return new Promise((resolve, reject) => resolve('unknown'));
    }
  }

}

interface ZosmfTrackerServiceResponse {
  online: boolean,
  error?: string
}

export type ServerStatus = 'online' | 'offline' | 'unknown' | 'testing';

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

