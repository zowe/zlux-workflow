/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { WorkflowPopupMenuComponent } from './workflow-popup-menu.component';

@Injectable()
export class WorkflowPopupMenuService {
  private popupMenus: WorkflowPopupMenuComponent[] = [];
  constructor() { }

  hideAll(): void {
    this.popupMenus.forEach(menu => menu.hide());
  }

  registerPopupMenu(popupMenu: WorkflowPopupMenuComponent): void {
    this.popupMenus.push(popupMenu);
  }

  unregisterPopupMenu(popupMenu: WorkflowPopupMenuComponent): void {
    this.popupMenus = this.popupMenus.filter(menu => menu !== popupMenu);
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
