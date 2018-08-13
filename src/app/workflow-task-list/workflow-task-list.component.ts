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
import { WorkflowStepsComponent } from '../workflow-steps/workflow-steps.component';


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


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
  @Output() stepSelected = new EventEmitter<WorkflowStep>();
  private pendingTasksShown: boolean = false;
  private completedTasksShown: boolean = false;
  private readonly pendingStates: string[] = ['Assigned', 'Ready', 'Failed', 'Submitted', 'Assigned', 'Not Ready', 'In Progress'];
  private readonly completedStates: string[] = ['Complete', 'Skipped', 'Complete (Override)'];
  private stepStateFilter: WorkflowStepStateFilter = {};
  private contentHidden: boolean = false;

  private selectedStep: WorkflowStep;
  @HostBinding('@collapsed') get getCollapsed(): string {
    return this.collapsed;
  }


  constructor() {

  }

  ngOnInit() {
    this.tooglePendingTasks();
  }

  startStep(step: WorkflowStep): void {
    logger.info(`start step ${step.name}`);
    this.selectedStep = step;
    this.stepSelected.emit(step);
  }

  toogle(): void {
    if (this.collapsed === 'yes') {
      this.contentHidden = false;
      this.collapsed = 'no';
    } else {
      this.collapsed = 'yes';
      this.contentHidden = true;
    }
    console.log(`toogle ${this.collapsed}`);
  }

  tooglePendingTasks(): void {
    this.pendingTasksShown = !this.pendingTasksShown;
    this.pendingStates.forEach(state => this.stepStateFilter[state] = this.pendingTasksShown);
  }

  toogleCompletedTasks(): void {
    this.completedTasksShown = !this.completedTasksShown;
    this.completedStates.forEach(state => this.stepStateFilter[state] = this.completedTasksShown);
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

