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
import * as Rx from 'rxjs/Rx';

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
  isVisible = false;
  private added: string[] = [];
  private removed: string[] = [];
  private currentAssignees: string[] = [];

  constructor(
    private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
  }

  init(): void {
    this.currentAssignees =  this.getStepAssignees();
    this.added = [];
    this.removed = [];
  }

  getStepAssignees(): string[] {
    if (this.step && this.step.assignees) {
      return this.step.assignees.toLowerCase().split(', ');
    }
    return [];
  }

  get assignees(): string[] {
    return this.currentAssignees;
  }

  addAssignee(userid: string): void {
    if (!this.currentAssignees.includes(userid)) {
      this.currentAssignees.push(userid);
      if (!this.removed.includes(userid)) {
        this.added.push(userid);
      } else {
        this.removed = this.removed.filter(id => id !== userid)
      }
    }
    this.userid = '';
  }

  removeAssignee(userid: string): void {
    if (this.currentAssignees.includes(userid)) {
      this.currentAssignees = this.currentAssignees.filter(id => id !== userid);
      if (!this.added.includes(userid)) {
        this.removed.push(userid);
      } else {
        this.added = this.added.filter(id => id !== userid)
      }
    }
  }

  save(): void {
    this.applyChanges()
    .subscribe(
      () => logger.info(`step ${this.step.name} assignee list changed`),
      (err) => this.loggerService.zosmfError(err)
    );
  }

  applyChanges(): Rx.Observable<any> {
    if (!this.dirty) {
      return Rx.Observable.of({});
    }
    const added = this.added.map(
      userid => this.zosmfWorkflowService.assignStepToUser(this.step, userid).catch(err => this.catchError(err))
    );
    const removed = this.removed.map(
      userid => this.zosmfWorkflowService.removeUserFromStepAssignees(this.step, userid).catch(err => this.catchError(err))
    );
    const observables = [...added, ...removed];
    this.showVeil();
    return Rx.Observable.forkJoin(observables)
      .defaultIfEmpty([])
      .mergeMap(() => this.zosmfWorkflowService.updateWorkflow(this.step.workflow))
      .finally(() => this.init())
      .finally(() => this.hideVeil());
  }

  catchError(err: Response): Rx.Observable<void> {
    this.loggerService.zosmfError(err);
    return Rx.Observable.of();
  }

  cancelChanges(): void {
    this.init();
  }

  private showVeil(): void {
    this.isVeilEnabled = true;
  }

  private hideVeil(): void {
    this.isVeilEnabled = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['step']) {
      this.init();
    }
  }

  show(): void {
    this.init();
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  onClose(): void {
    this.cancel();
  }

  ok(): void {
    this.applyChanges().subscribe(() => this.hide());
  }

  cancel(): void {
    this.cancelChanges();
    this.hide();
  }

  get dirty(): boolean {
    return this.added.length > 0 || this.removed.length > 0;
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
