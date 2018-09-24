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
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import { WorkflowStep } from '../shared/workflow-step';
import { ZosmfWorkflowService } from './../shared/zosmf-workflow-service';
import { Assignee } from '../shared/assignee';
import { mergeMap } from 'rxjs-compat/operator/mergeMap';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-step-assignment',
  templateUrl: './workflow-step-assignment.component.html',
  styleUrls: ['./workflow-step-assignment.component.css']
})
export class WorkflowStepAssignmentComponent implements OnInit, OnChanges {
  @Input() step: WorkflowStep;
  userid: string;
  isVeilEnabled = false;
  private history: AssignmentOperation[] = [];
  private currentAssignees: string[] = [];

  constructor(
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
  }

  getStepAssignees(): string[] {
    if (this.step.assignees) {
      return this.step.assignees.toLowerCase().split(', ');
    }
    return [];
  }

  get assignees(): string[] {
    return this.currentAssignees;
  }

  get added(): string[] {
    return this.history.filter(op => op.type === 'add').map(op => op.userid);
  }

  get removed(): string[] {
    return this.history.filter(op => op.type === 'remove').map(op => op.userid);
  }

  addAssignee(userid: string): void {
    this.applyOp({type: 'add', userid: userid});
    this.userid = '';
  }

  removeAssignee(userid: string): void {
    this.applyOp({type: 'remove', userid});
  }

  private applyOp(op: AssignmentOperation): boolean {
    if (op.type === 'add') {
      if (!this.currentAssignees.includes(op.userid)) {
        this.currentAssignees.push(op.userid);
        this.history.push(op);
        return true;
      }
      return false;
    } else if (op.type === 'remove') {
      const index = this.currentAssignees.indexOf(op.userid)
      if (index !== -1) {
        this.currentAssignees.splice(index, 1);
        this.history.push(op);
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  applyChanges(): void {
    this.showVeil()
    this.zosmfWorkflowService.addStepAssignees(this.step, this.added.map(userid => <Assignee>{id: userid, type: 'userid'}))
    .mergeMap(
      () => this.zosmfWorkflowService.removeStepAssignees(this.step, this.removed.map(userid => <Assignee>{id: userid, type: 'userid'}))
    )
    .finally(() => this.currentAssignees =  this.getStepAssignees())
    .finally(() => this.history =  [])
    .finally(() => this.hideVeil())
    .subscribe(
      () => logger.debug(`step ${this.step.name} assignee list changed`),
      (err) => this.loggerService.zosmfError(err)
    );
  }

  cancelChanges(): void {
    this.currentAssignees =  this.getStepAssignees();
    this.history = [];
}

  private showVeil(): void {
    this.isVeilEnabled = true;
  }

  private hideVeil(): void {
    this.isVeilEnabled = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['step']) {
      this.currentAssignees =  this.getStepAssignees();
      this.history = [];
    }
  }

  get dirty(): boolean {
    return this.history.length > 0;
  }

}

interface AssignmentOperation {
  type: 'add' | 'remove';
  userid: string;
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
