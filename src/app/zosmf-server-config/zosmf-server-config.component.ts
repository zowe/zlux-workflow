
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import {
  Component,
  EventEmitter,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
  } from '@angular/core';
import { GlobalVeilService } from '../shared/global-veil-service';
import { logger } from '../shared/logger';
import { ZosmfLoginComponent } from '../zosmf-login/zosmf-login.component';
import { ZosmfServer } from '../shared/zosmf-server-config';
import { ZosmfServerComponent } from '../zosmf-server/zosmf-server.component';
import { ZosmfServerConfig } from '../shared/zosmf-server-config';
import { ZosmfServerConfigService } from '../shared/zosmf-server-config.service';
import { LoggerService } from '../shared/logger-service';
import { ZluxPopupManagerService, ZluxErrorSeverity} from '@zlux/widgets';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'zosmf-server-config',
  templateUrl: './zosmf-server-config.component.html',
  styleUrls: [
    './zosmf-server-config.component.css',
    '../css/workflow-common-styles.css'
  ]
})
export class ZosmfServerConfigComponent {
  config: ZosmfServerConfig = {
    defaultZosmfServer: null,
    zosmfServers: []
  };
  private loggerService: LoggerService;

  @ViewChild('zosmflogin') zosmfLoginComponent: ZosmfLoginComponent;
  @ViewChild('defaultzosmfserver')
  defaultZosmfServerComponent: ZosmfServerComponent;
  @ViewChildren(ZosmfServerComponent)
  zosmfServers: QueryList<ZosmfServerComponent>;
  @Output() configured = new EventEmitter<ZosmfServer>();
  private zosmfServerCandidate: ZosmfServer;
  private popupEnabled: boolean;

  constructor(
    private configService: ZosmfServerConfigService,
    private globalVeilService: GlobalVeilService,
    private popupManager: ZluxPopupManagerService,
  ) {
    const config = this.configService.getCachedConfig();
    popupManager.setLogger(logger);
    this.popupEnabled = true;
    if (config) {
      this.config = config;
    } else {
      this.reload();
    }
  }

  newServer(): void {
    if (!Array.isArray(this.config.zosmfServers)) {
      this.config.zosmfServers = [];
    }
    this.config.zosmfServers.push({ host: '', port: 11443 });
  }

  save(): void {
    this.configService.saveConfig(this.config);
  }

  unsavedChanges(): boolean {
    if (this.configService.getLocalConfig().zosmfServers.length != this.config.zosmfServers.length)
      { return true; }
    if (this.configService.getLocalConfig().defaultZosmfServer.host != this.config.defaultZosmfServer.host &&
        this.configService.getLocalConfig().defaultZosmfServer.port != this.config.defaultZosmfServer.port)
      { return true; }
    for (let check = this.config.zosmfServers.length; check--;)
    {
      if (this.config.zosmfServers[check].host != this.configService.getLocalConfig().zosmfServers[check].host &&
      this.config.zosmfServers[check].port != this.configService.getLocalConfig().zosmfServers[check].port)
      { return true; }
    }
    return false;
  }

  setDefault(item: ZosmfServer) {
    this.zosmfServerCandidate = item;
    this.zosmfLoginComponent.setZosmfServer(item);
    this.zosmfLoginComponent.show();
  }

  test(): void {
    if (this.zosmfServers) {
      this.zosmfServers.forEach(item => {
        item.test();
      });
    }
  }

  ok(): void {
    this.save();
    this.configured.emit(this.config.defaultZosmfServer);
  }

  cancel(): void {
    this.reload();
  }

  reload(): void {
      this.globalVeilService.showVeil();
      this.configService
        .getConfig()
        .then(config => (this.config = config))
        .then(_ => setTimeout(() => this.test(), 0))
        .then(_ => this.globalVeilService.hideVeil())
        .catch(err => {
          this.globalVeilService.hideVeil()
          let errorTitle: string = "Error";
          let errorMessage: string = "Server configuration not found.";
          const options = {
            blocking: true
          };
            this.popupEnabled = true;
            this.popupManager.reportError(ZluxErrorSeverity.ERROR, errorTitle.toString()+": "+err.status.toString(), errorMessage+"\n"+err.toString(), options);  
          });
  }

  remove(zosmfServer: ZosmfServer): void {
    const servers = this.config.zosmfServers;
    const index = servers.indexOf(zosmfServer);
    servers.splice(index, 1);
  }

  login(): void {
    this.config.defaultZosmfServer = {
      host: this.zosmfServerCandidate.host,
      port: this.zosmfServerCandidate.port
    };
    setTimeout(_ => this.testDefaultServer(), 0);
    this.zosmfLoginComponent.hide();
  }

  testDefaultServer(): void {
    if (this.zosmfServers && this.zosmfServers.first) {
      this.zosmfServers.first.test()
    }
  }

  loginCanceled(): void {
    this.zosmfLoginComponent.setZosmfServer(this.config.defaultZosmfServer);
  }

  togglePopup(toggle: boolean): void {
    this.popupEnabled = toggle;
  }


}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

