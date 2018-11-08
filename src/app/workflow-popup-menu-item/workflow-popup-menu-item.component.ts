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
  Output,
} from '@angular/core';
import { ConfirmationService } from './../shared/confirmation.service';

@Component({
  selector: 'workflow-popup-menu-item',
  templateUrl: './workflow-popup-menu-item.component.html',
  styleUrls: [
    '../css/workflow-common-styles.css',
    './workflow-popup-menu-item.component.css'
  ]
})
export class WorkflowPopupMenuItemComponent {
  @Input() confirmationQuestion: string;
  @Output() onClick = new EventEmitter<void>();

  constructor(private confirmationService: ConfirmationService) { }

  onMouseClick(event: MouseEvent): void {
    if (this.confirmationQuestion) {
      this.confirmationService.show(this.confirmationQuestion).subscribe((result: boolean) => {
        if (result) {
          this.onClick.emit();
        }
      })
    } else {
      this.onClick.emit();
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
