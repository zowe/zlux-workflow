/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Input,
  Inject,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  Angular2InjectionTokens,
  } from 'pluginlib/inject-resources';
import { logger } from '../shared/logger';
import { Observable } from 'rxjs/Observable';
import { WizardStepType } from '../shared/wizard-step';
import { Workflow } from '../shared/workflow';
import { WorkflowStep } from '../shared/workflow-step';
import { WorkflowStepPluginAction } from '../shared/workflow-step-plugin-action';
import { WorkflowVariable } from '../shared/workflow-variable';
import { LoggerService } from '../shared/logger-service';
import { ZosmfLoginService } from '../shared/zosmf-login.service';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';
import 'rxjs/add/operator/do';


@Component({
  selector: "workflow-step-status",
  templateUrl: "./workflow-step-status.component.html",
  styleUrls: [
    "./workflow-step-status.component.css",
    "../css/workflow-common-styles.css"
  ],
  providers: []
})

export class WorkflowStepStatusComponent
  implements OnInit, OnChanges, AfterViewInit, AfterContentInit {

  activeTabKey = null;
  isWizardVeilEnabled = false;

  @Input() step: WorkflowStep;

  constructor (
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
  ) {

  }

  ngOnInit(): void {

  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initialize();
  }

  initialize(): void {
    if (this.step) {
      this.getJobStatusWithFiles().subscribe(_ => this.activateFirstSpoolFileTab())
    }
  }

  keys(o: object): any[] {
    if (o) {
      return Object.keys(o);
    } else {
      return [];
    }
  }

  updateJobStatus(): void {
    this.showVeil();
    this.getJobStatusWithFiles()
      .finally(() => this.hideVeil())
      .subscribe(
        _ => logger.info('job output updated'),
        err => this.loggerService.zosmfError(err)
      );
  }

  getJobStatusWithFiles(): Observable<any> {
    return this.zosmfWorkflowService
      .getJobStatusWithFiles(this.step)
      .do(_ => logger.info('getJobStatusWithFiles done'))
      .do(_ => this.activateFirstSpoolFileTab());
  }

  activateFirstSpoolFileTab(): void {
    if (!this.activeTabKey) {
      const ddnames = this.keys(this.step.wizard.performJobfiles);
      if (ddnames && ddnames.length > 0) {
        this.activeTabKey = ddnames[0];
      } else {
        this.activeTabKey = null;
      }
    }
  }

  private showVeil(): void {
    this.isWizardVeilEnabled = true;
  }

  private hideVeil(): void {
    this.isWizardVeilEnabled = false;
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/