

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { ZluxPopupManagerService } from '@zlux/widgets';

@Component({
  selector: "workflow-popup",
  templateUrl: "workflow-popup.component.html",
  styleUrls: ["workflow-popup.component.css"]
})
export class WorkflowPopupComponent implements OnInit, OnDestroy {
  @Input() header: string;
  @Input() dark: boolean;

  @Output() onCloseWindow = new EventEmitter<any>();

  constructor(private popupManager: ZluxPopupManagerService) { }
  ngOnInit() {
    this.popupManager.block();
  }

  ngOnDestroy() {
    this.popupManager.unblock();
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

