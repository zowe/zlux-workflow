

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {Component, OnInit, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

import {ZosmfServer} from '../shared/zosmf-server-config';
import {ZosmfLoginService} from '../shared/zosmf-login.service';
import {logger} from '../shared/logger';

@Component({
  selector: 'zosmf-login',
  templateUrl: './zosmf-login.component.html',
  styleUrls: ['./zosmf-login.component.css']
})
export class ZosmfLoginComponent implements OnInit {
  @Output() loggedIn = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @ViewChild('userid', {read: ElementRef}) useridElementRef: ElementRef;
  private zosmfUserid: string;
  private zosmfPassword: string;
  private authFailed: boolean = false;
  private isVisible: boolean = false;
  private errorMessage: string = '';

  constructor(private loginService: ZosmfLoginService) {
  }

  ngOnInit() {
  }

  login(): void {
    this.loginService.login(this.zosmfUserid, this.zosmfPassword)
      .then(_ => this.loginSuccessed(), err => this.loginFailed(err));
  }

  loginSuccessed(): void {
    logger.info(`user ${this.zosmfUserid} authenticaticated`);
    this.authFailed = false;
    this.isVisible = false;
    this.loggedIn.emit();
  }

  loginFailed(err: any): void {
    logger.info(`z/OSMF login failed: ${err.text()}`);
    this.authFailed = true;
    if (err.status === 403) {
      this.errorMessage = 'Authenticatication failed. Please check that User ID and password are correct.';
    } else {
      this.errorMessage = `Unable to connect to z/OSMF (${err.text()})`;
    }
  }

  get userid(): string {
    return this.loginService.userid;
  }

  get host(): string {
    return this.loginService.host;
  }

  get port(): number {
    return this.loginService.port;
  }

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  cancel(): void {
    this.resetError();
    this.hide();
    this.canceled.emit();
  }

  setZosmfServer(server: ZosmfServer): void {
    this.loginService.host = server.host;
    this.loginService.port = server.port;
  }

  resetError(): void {
    this.authFailed = false;
    this.errorMessage = '';
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

