
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
import {
  animate,
  state,
  style,
  transition,
  trigger
  } from '@angular/animations';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
  } from '@angular/core';
import { logger } from '../shared/logger';
import { Workflow } from '../shared/workflow';
import {
  WorkflowStep,
  WorkflowStepStateFilter
  } from '../shared/workflow-step';
import {WorkflowStepAction} from '../shared/workflow-step-action';
import { WorkflowStepsComponent } from '../workflow-steps/workflow-steps.component';

@Component({
  selector: 'workflow-task-list',
  templateUrl: 'workflow-task-list.component.html',
  styleUrls: [
    'workflow-task-list.component.css',
    '../css/workflow-common-styles.css'
  ],
  animations: [
    trigger('collapsed', [
      state(
        'yes',
        style({
          width: '40px'
        })
      ),
      state(
        'no',
        style({
          width: '*'
        })
      ),
      transition('yes => no', animate('200ms linear')),
      transition('no => yes', animate('200ms linear'))
    ])
  ],
   entryComponents: [
    WorkflowStepsComponent
  ]
})


export class WorkflowTaskListComponent implements OnInit {
  @Input() workflows: Workflow[];
  @Input() userid: string;
  @Input() shownStates: string[] = [];
  @Input() collapsed: string = 'no';
  @Input() selectedStep: WorkflowStep;
  @Output() stepSelectedAction = new EventEmitter<WorkflowStepAction>();
  pendingTasksShown: boolean = false;
  completedTasksShown: boolean = false;
  readonly pendingStates: string[] = ['Assigned', 'Ready', 'Failed', 'Submitted', 'Assigned', 'Not Ready', 'In Progress'];
  readonly completedStates: string[] = ['Complete', 'Skipped', 'Complete (Override)'];
  stepStateFilter: WorkflowStepStateFilter = {};
  contentHidden: boolean = false;
  filterState: string = 'pending'; //FilterState = FilterState.pending;

  @HostBinding('@collapsed') get getCollapsed(): string {
    return this.collapsed;
  }

  constructor() {

  }

  ngOnInit() {
    this.togglePendingTasks();
  }

  startStep(stepAction: WorkflowStepAction): void {
    logger.info(`workflow-task-list: start step ${stepAction.step.name}`);
    this.selectedStep = stepAction.step;
    this.stepSelectedAction.emit(stepAction);
  }

  toggle(): void {
    if (this.collapsed === 'yes') {
      this.contentHidden = false;
      this.collapsed = 'no';
    } else {
      this.collapsed = 'yes';
      this.contentHidden = true;
    }
    console.log(`toggle ${this.collapsed}`);
  }

  // When I switched from toggle with completed/pending to radio behavior
  // with pending/completed/all, I didn't want to spend the time to refactor properly,
  // so these three toggle functions are not necessarily the best solution.
  // I also wanted to use an enum, but I had trouble figuring out how to use it
  // in the template.

//  enum FilterState {
//    pending = "pending",
//    completed = "completed",
//    all = "all"
//  }

togglePendingTasks(): void {
    this.filterState = 'pending';
    this.pendingStates.forEach(state => this.stepStateFilter[state] = true);
    this.completedStates.forEach(state => this.stepStateFilter[state] = false);
  }

  toggleCompletedTasks(): void {
    this.filterState = 'completed';
    this.pendingStates.forEach(state => this.stepStateFilter[state] = false);
    this.completedStates.forEach(state => this.stepStateFilter[state] = true);
  }

  toggleAllTasks(): void {
    this.filterState = 'all';
    this.pendingStates.forEach(state => this.stepStateFilter[state] = true);
    this.completedStates.forEach(state => this.stepStateFilter[state] = true);
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

