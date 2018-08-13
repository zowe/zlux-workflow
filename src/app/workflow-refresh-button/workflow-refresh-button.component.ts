
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
  Input,
  Output
  } from '@angular/core';

import '../images/refresh.svg';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-refresh-button',
  templateUrl: './workflow-refresh-button.component.html',
  styleUrls: [
    './workflow-refresh-button.component.css',
    './../css/workflow-common-styles.css'
  ]
})
export class WorkflowRefreshButtonComponent {
  @Output() onClick = new EventEmitter<void>();
  @Input() theme: 'light'| 'dark' = 'light';
  @Input() buttonSize = 24;
  @Input() iconSize = 24;
  @Input() title: string;
  constructor() {}

  click(): void {
    this.onClick.emit();
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

