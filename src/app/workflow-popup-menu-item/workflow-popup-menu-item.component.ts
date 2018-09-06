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
} from '@angular/core';

@Component({
  selector: 'workflow-popup-menu-item',
  templateUrl: './workflow-popup-menu-item.component.html',
  styleUrls: [
    '../css/workflow-common-styles.css',
    './workflow-popup-menu-item.component.css'
  ]
})
export class WorkflowPopupMenuItemComponent {
  @Output() onClick = new EventEmitter<void>();

  constructor() { }

  onMouseClick(event: MouseEvent): void {
    console.log('workflow-popup-menu-item on click');
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
