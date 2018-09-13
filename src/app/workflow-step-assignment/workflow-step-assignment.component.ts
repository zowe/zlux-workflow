/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import { WorkflowStep } from '../shared/workflow-step';
import { ZosmfWorkflowService } from './../shared/zosmf-workflow-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-step-assignment',
  templateUrl: './workflow-step-assignment.component.html',
  styleUrls: ['./workflow-step-assignment.component.css']
})
export class WorkflowStepAssignmentComponent implements OnInit {
  @Input() step: WorkflowStep;
  userid: string;
  isVeilEnabled = false;
  constructor(
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
  }

  get assignees(): string[] {
    if (this.step.assignees) {
      return this.step.assignees.toLowerCase().split(', ');
    }
    return [];
  }

  addAssignee(userid: string): void {
    this.showVeil();
    this.zosmfWorkflowService.assignStepToUser(this.step, userid)
      .finally(() => this.userid = '')
      .finally(() => this.hideVeil())
      .subscribe(
        () => logger.debug(`step ${this.step.name} assigned to ${userid}`),
        (err) => this.loggerService.zosmfError(err)
      );
  }

  removeAssignee(userid: string): void {
    this.showVeil();
    this.zosmfWorkflowService.removeUserFromStepAssignees(this.step, userid)
      .finally(() => this.hideVeil())
      .subscribe(
        () => logger.debug(`${userid} has been removed from assignees list of ${this.step.name}`),
        (err) => this.loggerService.zosmfError(err)
      );
  }

  private showVeil(): void {
    this.isVeilEnabled = true;
  }

  private hideVeil(): void {
    this.isVeilEnabled = false;
  }

}
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
