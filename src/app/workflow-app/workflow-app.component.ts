
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import {
  AfterContentInit,
  Component,
  Inject,
  ViewChild
  } from '@angular/core';
import {
  Angular2InjectionTokens,
  ViewportId,
  Angular2PluginWindowActions
  } from 'pluginlib/inject-resources';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import { Workflow } from '../shared/workflow';
import { GlobalVeilService } from '../shared/global-veil-service';
import { WorkflowAppLaunchMetadata } from '../shared/workflow-app-launch-metadata';
import { WorkflowListComponent } from '../workflow-list/workflow-list.component';
import { WorkflowNotificationComponent } from '../workflow-notification/workflow-notification.component';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepStateFilter } from '../shared/workflow-step';
import { WorkflowStepWizardComponent } from '../workflow-step-wizard/workflow-step-wizard.component';
import { WorkflowTaskListComponent } from '../workflow-task-list/workflow-task-list.component';
import { WorkflowView } from '../shared/workflow-view';
import { WorkflowWarningsComponent } from '../workflow-warnings/workflow-warnings.component';
import { ZosmfLoginComponent } from '../zosmf-login/zosmf-login.component';
import { ZosmfLoginService } from '../shared/zosmf-login.service';
import { ZosmfServer } from '../shared/zosmf-server-config';
import { ZosmfServerConfigComponent } from '../zosmf-server-config/zosmf-server-config.component';
import { ZosmfServerConfigService } from '../shared/zosmf-server-config.service';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';


@Component({
  selector: 'workflow-app',
  templateUrl: './workflow-app.component.html',
  styleUrls: ['./workflow-app.component.css', '../css/workflow-common-styles.css'],
  entryComponents: [WorkflowNotificationComponent]
})
export class WorkflowAppComponent implements AfterContentInit {
  @ViewChild('workflowlist')
  workflowListComponent: WorkflowListComponent;

  @ViewChild('workflowtasklist')
  workflowTaskListComponent: WorkflowTaskListComponent;

  @ViewChild('warnings')
  workflowWarningsComponent: WorkflowWarningsComponent;

  @ViewChild('workflowstepwizard')
  workflowStepWizardComponent: WorkflowStepWizardComponent;

  @ViewChild('zosmflogin')
  zosmfLoginComponent: ZosmfLoginComponent;

  @ViewChild('zosmfserverconfig')
  zosmfServerConfigComponent: ZosmfServerConfigComponent;

  workflows: Workflow[] = [];
  selectedStep: WorkflowStep = null;
  selectedWorkflow: Workflow;
  myTasksActive = true;
  private loggedIn: boolean = false;
  private userid: string;
  private configured: boolean = false;
  private defaultZosmfServer: ZosmfServer;
  private nextWorkflowStepIsReady: boolean = false;
  private viewCreateWorkflow: boolean = false;
  private activeMenuItem: WorkflowView = 'My Tasks';

  constructor(
    @Inject(Angular2InjectionTokens.LAUNCH_METADATA) private launchMetadata: WorkflowAppLaunchMetadata,
    @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions,
    @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition,
    private configService: ZosmfServerConfigService,
    private loggerService: LoggerService,
    private globalVeilService: GlobalVeilService,
    private loginService: ZosmfLoginService,
    private zosmfWorkflowService: ZosmfWorkflowService
  ) {
    this.configured = configService.configured;
    if (this.configured) {
      this.defaultZosmfServer = configService.defaultZosmfServer;
      this.userid = loginService.userid;
      loginService.host = this.defaultZosmfServer.host;
      loginService.port = this.defaultZosmfServer.port;
      loginService.checkAuth()
        .then(_ => this.login(), _ => this.zosmfLoginComponent.show());
    }
  }

  initWorkflowList(): void {
    this.globalVeilService.showVeil();
    this.zosmfWorkflowService.getWorkflowList()
      .finally(() => this.globalVeilService.hideVeil())
      .subscribe((workflows: Workflow[]) => {
        this.showMyTasks();
        this.workflows = workflows;
      });
  }

  ngAfterContentInit(): void {
    if (!this.configured) {
      this.showConfiguration();
    }
  }

  onStepSelected(step: WorkflowStep): void {
    this.selectedStep = step;
  }

  onWorkflowSelected(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
  }

  hasSelectedStep(): boolean {
    return (this.selectedStep && (this.selectedStep.isJclStep() || this.selectedStep.isSimpleStep()));
  }

  hasSelectedWorkflow(): boolean {
    return !!this.selectedWorkflow;
  }

  showMyTasks(): void {
    this.activeMenuItem = 'My Tasks';
  }

  showWorkflows(): void {
    this.activeMenuItem = 'Workflows';
    this.workflowListComponent.update();
  }

  showConfiguration(): void {
    this.activeMenuItem = 'Configuration';
    this.zosmfServerConfigComponent.test();
  }

  showWarnings(): void {
    this.activeMenuItem = 'Warnings';
    this.workflowWarningsComponent.update();
  }

  showView(view: WorkflowView): void {
    switch (view) {
      case 'My Tasks':
        this.showMyTasks();
        break;
      case 'Workflows':
        this.showWorkflows();
        break;
      case 'Configuration':
        this.showConfiguration();
        break;
      case 'Warnings':
        this.showWarnings()
        break;
    }
  }

  refresh(): void {
    this.globalVeilService.showVeil();
    this.zosmfWorkflowService.getWorkflowList()
      .finally(() => this.globalVeilService.hideVeil())
      .subscribe((workflows: Workflow[]) => {
        this.workflows = workflows;
      });
  }

  login() {
    this.loggedIn = true;
    this.userid = this.zosmfLoginComponent.userid;
    this.zosmfWorkflowService.initialize(this.userid, this.defaultZosmfServer.host, this.defaultZosmfServer.port);
    this.updateWindowTitle()
    if (this.launchMetadata) {
      if (this.launchMetadata.action === "startWorkflow") {
        this.zosmfWorkflowService.createWorkflow(this.launchMetadata.actionData, this.launchMetadata.actionOptions)
          .subscribe(() => this.initWorkflowList(),
            err => {
              this.loggerService.zosmfError(err);
              this.initWorkflowList();
            });
      }
    } else {
      this.initWorkflowList();
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  onConfigured(zosmfServer: ZosmfServer): void {
    logger.info(`configured: ${JSON.stringify(zosmfServer)}`);
    this.defaultZosmfServer = zosmfServer;
    this.loginService.host = this.defaultZosmfServer.host;
    this.loginService.port = this.defaultZosmfServer.port;
    this.configured = true;
    this.updateWindowTitle();
    this.loginService.checkAuth()
      .then(_ => this.login(), _ => this.zosmfLoginComponent.show());
  }

  onShowCreateWorkflowForm(view: boolean) {
    this.viewCreateWorkflow = view;
  }

  updateWindowTitle() {
    var basePlugIn = this.pluginDefinition.getBasePlugin();
    var webContent = basePlugIn.getWebContent();
    var nameDefault = webContent.launchDefinition.pluginShortNameDefault;
    var myHost = this.loginService.host.toString();
    this.windowActions.setTitle(`${nameDefault} (${myHost})`);
  }
  onStepChangeRequested(step: WorkflowStep): void {
    this.workflowTaskListComponent.startStep(step);
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

