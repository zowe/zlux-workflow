/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { DatePipe } from '@angular/common';
import {
  Inject,
  Injectable
  } from '@angular/core';
import { logger } from './logger';
import { Subject } from 'rxjs/Subject';
import { Message } from './message';

@Injectable()
export class LoggerService {
  private readonly messageSource: Subject<Message> = new Subject<Message>();
  private logger: ZLUX.ComponentLogger = logger;
  private datePipe = new DatePipe('en-US');

  readonly messageObservable = this.messageSource.asObservable();

  constructor() {
  }

  info(message: string, workflowName?: string): void {
    this.logger.info(message);
    this.emitMessage(message, workflowName);
  }

  warn(message: string, workflowName?: string): void {
    this.logger.warn(message);
    this.emitMessage(message, workflowName);
  }

  debug(message: string, workflowName?: string): void {
    this.logger.debug(message);
    this.emitMessage(message, workflowName);
  }

  zosmfError(errResponse: Response): void {
    const err: any = errResponse.json() || '';
    const message = this.decodeZosmfError(err);
    this.warn(`MVDA1003E Request to zosmf failed because: ${message}`);
  }

  private decodeZosmfError(err: ZosmfErrorType1 | ZosmfErrorType2 | string) {
    let message = '';
    const err1 = err as ZosmfErrorType1;
    const err2 = err as ZosmfErrorType2;
    const err3 = err.toString();
    if (err1 && err1.errorData && err1.errorData[0] && err1.errorData[0].messageText) {
      message = err1.errorData[0].messageText;
    } else if (err2 && err2.messageText) {
      message = err2.messageText;
    } else if (err2 && err2.messageID) {
      message = err2.messageID;
    } else {
      message = err3;
    }
    return message;
  }


  private emitMessage(textMessage: string, workflowName: string): void {
    const {code, text} = this.parseMessage(textMessage);
    const message: Message = {
      code: code,
      text: text,
      date: this.formatCurrentdateDate(),
      workflow: workflowName || ''
    };
    this.messageSource.next(message);
  }

  private parseMessage(message: string): {code: string, text: string} {
    if (message.startsWith('MVD')) {
       return {
         code: message.substr(0, message.indexOf(' ')),
         text: message.substr(message.indexOf(' '))
        };
    }
    return {code: '', text: message};
  }

  private formatCurrentdateDate(): string {
    return this.datePipe.transform(Date.now(), 'short');
  }
}

interface ZosmfErrorType1 {
  errorData: ZosmfErrorData[]
}

interface ZosmfErrorType2 {
  messageText: string | null;
  messageID: string | null;
}

interface ZosmfErrorData {
  messageText: string;
  messageId: string;
  stackTrace: string;
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
