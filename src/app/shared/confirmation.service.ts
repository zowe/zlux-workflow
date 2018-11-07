/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ConfirmationService {
  visible: boolean = false;
  question: string;
  private subject: Subject<boolean>;

  constructor() { }

  show(question: string): Observable<boolean> {
    this.question = question;
    this.visible = true;
    this.subject = new Subject<boolean>();
    return this.subject.asObservable();
  }

  confirm(): void {
    this.visible = false;
    this.subject.next(true);
  }

  cancel(): void {
    this.visible = false;
    this.subject.next(false);
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
