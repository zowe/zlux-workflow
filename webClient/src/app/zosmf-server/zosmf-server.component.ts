
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  ServerStatus,
  ZosmfTrackerService
  } from '../shared/zosmf-tracker.service';
import { ZosmfServer } from '../shared/zosmf-server-config';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'zosmf-server',
  templateUrl: './zosmf-server.component.html',
  styleUrls: [
    './zosmf-server.component.css',
    '../css/workflow-common-styles.css'
  ],
  providers: [ZosmfTrackerService]
})
export class ZosmfServerComponent implements AfterContentInit {
  @Input() zosmfServer: ZosmfServer;
  @Input() showControls = false;
  @Input() theme: 'dark' | 'light' = 'light';
  @Output() setDefault = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();
  status: ServerStatus = 'unknown';
  @ViewChild('configForm') form: NgForm;
  private initialized = false;
  constructor(private zosmfTrackerService: ZosmfTrackerService) {}

  ngAfterContentInit(): void {
    this.initialized = true;
    this.form.valueChanges.subscribe(_ => {

      if (this.status !== 'unknown') {
        this.status = 'unknown';
      }
    });
  }

  setAsDefault(): void {
    this.setDefault.emit();
  }

  remove(): void {
    this.removed.emit();
  }

  get online(): boolean {
    return this.status === 'online';
  }

  test(): void {
    if (this.initialized) {
      this.status = 'testing';
      this.zosmfTrackerService
        .testConnection(this.zosmfServer.host, this.zosmfServer.port)
        .then(status => (this.status = status));
    }
  }

  getStatusIndicatorClass(): string {
    return `status-indicator-${this.status}`;
  }

  getStatusIndicatorTextClass(): string {
    return `status-indicator-text-${this.status}`;
  }

  getFormClass(): string {
    return this.theme;
  }

  isDark(): boolean {
    return this.theme === 'dark';
  }

  getButtonVisibilityStyle(): string {
    return this.showControls ? '' : 'hidden';
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

