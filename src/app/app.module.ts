

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { NgModule } from '@angular/core';
import { ZluxGridModule } from '@zlux/grid';
import {
  ZluxPopupWindowModule,
  ZluxPopupManagerModule,
  ZluxButtonModule,
  ZluxFlyoverModule,
  ZluxInputTextModule,
  ZluxCheckboxModule,
  ZluxPaginatorModule,
  ZluxVeilModule
} from '@zlux/widgets';
import { LoggerService } from './shared/logger-service';
import { GlobalVeilService } from './shared/global-veil-service';
import { WorkflowAppComponent } from './workflow-app/workflow-app.component';
import { WorkflowCreateComponent } from './workflow-create/workflow-create.component';
import { WorkflowListComponent } from './workflow-list/workflow-list.component';
import { WorkflowNotificationComponent } from './workflow-notification/workflow-notification.component';
import { WorkflowPopupMenuComponent } from './workflow-popup-menu/workflow-popup-menu.component';
import { WorkflowPopupMenuItemComponent } from './workflow-popup-menu-item/workflow-popup-menu-item.component';
import { WorkflowPopupMenuSeparatorComponent } from './workflow-popup-menu-separator/workflow-popup-menu-separator.component';
import { WorkflowRefreshButtonComponent } from './workflow-refresh-button/workflow-refresh-button.component';
import { WorkflowStepAssignmentComponent } from './workflow-step-assignment/workflow-step-assignment.component';
import { WorkflowStepContainerComponent } from './workflow-step-container/workflow-step-container.component';
import { WorkflowStepGeneralComponent } from './workflow-step-general/workflow-step-general.component';
import { WorkflowStepStatusComponent } from './workflow-step-status/workflow-step-status.component';
import { WorkflowStepWizardComponent } from './workflow-step-wizard/workflow-step-wizard.component';
import { WorkflowStepsComponent } from './workflow-steps/workflow-steps.component';
import { WorkflowTaskListComponent } from './workflow-task-list/workflow-task-list.component';
import { WorkflowWarningsComponent } from './workflow-warnings/workflow-warnings.component';
import { ZosmfLoginComponent } from './zosmf-login/zosmf-login.component';
import { ZosmfServerComponent } from './zosmf-server/zosmf-server.component';
import { ZosmfServerConfigComponent } from './zosmf-server-config/zosmf-server-config.component';

import { ZosmfLoginService } from './shared/zosmf-login.service';
import { ZosmfServerConfigService } from './shared/zosmf-server-config.service';
import { ZosmfWorkflowService } from './shared/zosmf-workflow-service';

@NgModule({
  declarations: [
    WorkflowAppComponent,
    WorkflowCreateComponent,
    WorkflowListComponent,
    WorkflowNotificationComponent,
    WorkflowPopupMenuComponent,
    WorkflowPopupMenuItemComponent,
    WorkflowPopupMenuSeparatorComponent,
    WorkflowRefreshButtonComponent,
    WorkflowStepAssignmentComponent,
    WorkflowStepContainerComponent,
    WorkflowStepGeneralComponent,
    WorkflowStepStatusComponent,
    WorkflowStepWizardComponent,
    WorkflowStepsComponent,
    WorkflowTaskListComponent,
    WorkflowWarningsComponent,
    ZosmfLoginComponent,
    ZosmfServerComponent,
    ZosmfServerConfigComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ZluxButtonModule,
    ZluxCheckboxModule,
    ZluxFlyoverModule,
    ZluxGridModule,
    ZluxInputTextModule,
    ZluxPaginatorModule,
    ZluxPopupWindowModule,
    ZluxPopupManagerModule,
    ZluxVeilModule,
  ],
  providers: [
    LoggerService,
    GlobalVeilService,
    ZosmfLoginService,
    ZosmfServerConfigService,
    ZosmfWorkflowService,
  ],
  bootstrap: [WorkflowAppComponent]
})
export class AppModule { }



/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

