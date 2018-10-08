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

import '../images/caret-down.svg';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-caret-down-button',
  templateUrl: './workflow-caret-down-button.component.html',
  styleUrls: ['./workflow-caret-down-button.component.css']
})
export class WorkflowCaretDownButtonComponent {
  @Output() onClick = new EventEmitter<void>();
  @Input() theme: 'light'| 'dark' = 'light';
  @Input() buttonSize = 24;
  @Input() iconSize = 24;
  @Input() title: string = '';
  constructor() {}

  click(): void {
    console.log('on click');
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
