
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Component } from '@angular/core';
import { LoggerService } from '../shared/logger-service';
import { Message } from '../shared/message';

@Component({
  selector: 'workflow-notification',
  templateUrl: './workflow-notification.component.html',
  styleUrls: [
    './workflow-notification.component.css',
    './../css/workflow-common-styles.css'
  ]
})
export class WorkflowNotificationComponent {
  isVisible: boolean = false;
  message: string;
  constructor(private loggerService: LoggerService) {
    loggerService.messageObservable.subscribe(message => setTimeout(_ => this.showMessage(message.code + ' ' + message.text), 0));
  }

  showMessage(message: string): void {
    this.message = message;
    this.isVisible = true;
  }

  hideMessage(): void {
    this.isVisible = false;
  }

  ok(): void {
    this.hideMessage();
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

