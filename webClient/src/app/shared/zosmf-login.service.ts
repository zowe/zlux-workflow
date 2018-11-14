

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {Injectable, Inject} from '@angular/core';
import {Http, Headers } from '@angular/http';
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ZosmfLoginService {
  private loginUrl: string;
  private zosmfHost: string;
  private zosmfPort: number;
  private zosmfUserid: string;
  private zosmfPassword: string;
  private zosmfUseridKey: string;

  constructor(private http: Http,
  @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition) {
    this.loginUrl = ZoweZLUX.uriBroker.pluginRESTUri(this.pluginDefinition.getBasePlugin(), "zosmf", "/zosmf/workflow/rest/1.0/workflows");
    this.zosmfUseridKey = this.pluginDefinition.getBasePlugin().getIdentifier() + '.zosmf.userid';
    this.zosmfUserid = localStorage.getItem(this.zosmfUseridKey);
  }

  get userid(): string {
    return this.zosmfUserid;
  }

  set host(host: string) {
    this.zosmfHost = host;
  }

  set port(port: number) {
    this.zosmfPort = port;
  }

  get host(): string {
    return this.zosmfHost;
  }

  get port(): number {
    return this.zosmfPort;
  }

  login(userid: string, password: string): Promise<void> {
    this.zosmfUserid = userid;
    this.zosmfPassword = password;
    const basicAuth = this.getBasicAuth();
    const headers = new Headers();
    headers.append('ZOSMF-Authorization', basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    document.cookie = "LtpaToken2=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return this.http.get(this.loginUrl, {headers: headers})
      .map(_ => localStorage.setItem(this.zosmfUseridKey, this.zosmfUserid))
      .toPromise();
  }

  private getBasicAuth(): string {
    return 'Basic ' + btoa(this.zosmfUserid + ':' + this.zosmfPassword);
  }

  checkAuth(): Promise<any> {
    if (!!this.zosmfHost && !!this.zosmfPort && !!this.zosmfUserid) {
      const headers = new Headers();
      headers.append('ZOSMF-host', this.zosmfHost);
      headers.append('ZOSMF-port', this.zosmfPort.toString());
      return this.http.head(this.loginUrl, {headers: headers})
        .toPromise();
    } else {
      return new Promise((resolve, reject) => reject());
    }
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

