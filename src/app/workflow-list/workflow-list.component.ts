
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
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
  } from '@angular/core';
import { logger } from '../shared/logger';
import { Workflow } from '../shared/workflow';
import { ZluxPaginatorComponent } from '@zlux/widgets';
import { Angular2PluginViewportEvents, Angular2InjectionTokens } from 'pluginlib/inject-resources';
import { ZluxGridComponent } from '@zlux/grid';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: [
    './workflow-list.component.css',
    '../css/workflow-common-styles.css'
  ],
  providers: []
})
export class WorkflowListComponent implements AfterContentInit, OnChanges {
  workflowsToDisplay: Workflow[] = [];
  filteredWorkflows: Workflow[] = [];
  workflowsPerPage: number = 15;
  selectedWorkflow: Workflow;
  searchText: string;
  @Input() workflows: Workflow[] = [];
  @ViewChild('grid') grid: ZluxGridComponent;
  @ViewChild('paginator') paginator: ZluxPaginatorComponent;
  @Output() workflowSelected = new EventEmitter<Workflow>();
  @Output() onShowNewWorkflowDialog = new EventEmitter<void>();

  readonly displayHints = {
    isCustomTemplating: true,
    // note: custom templating doesn't work without formatParameters
    formatParameters: {
      valueMapping: '0'
    }
  };

  readonly columnMetaData: any = {
    columnMetaData: [
      {
        columnIdentifier: 'workflowName',
        shortColumnLabel: 'Workflow',
        longColumnLabel: 'Workflow',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints:  {...this.displayHints, defaultcolumnWidth: '200px'}
      },
      {
        columnIdentifier: 'workflowDescription',
        shortColumnLabel: 'description',
        longColumnLabel: 'Description',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '200px'}
      },
      {
        columnIdentifier: 'workflowVersion',
        shortColumnLabel: 'Version',
        longColumnLabel: 'Version',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '75px'}
      },
      {
        columnIdentifier: 'owner',
        shortColumnLabel: 'Owner',
        longColumnLabel: 'Owner',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '75px'}
      },
      {
        columnIdentifier: 'system',
        shortColumnLabel: 'System',
        longColumnLabel: 'System',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '200px'}
      },
      {
        columnIdentifier: 'statusName',
        shortColumnLabel: 'Status',
        longColumnLabel: 'Status',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '75px'}
      },
      {
        columnIdentifier: 'percentComplete',
        shortColumnLabel: 'Progress',
        longColumnLabel: 'Progress',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '150px'}
      },
    ]
  };
  constructor(@Inject(Angular2InjectionTokens.VIEWPORT_EVENTS) private viewPortEvents: Angular2PluginViewportEvents) {

  }

  ngAfterContentInit(): void {
    this.viewPortEvents.resized.subscribe(() => {
      this.updateRowsPerPage();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflows']) {
      if (this.workflows) {
        this.inithWorkflowList();
      }
    }
  }

  update(): void {
    setTimeout(_ => this.updateRowsPerPage(), 0);
  }

  selectWorkflow(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
    this.workflowSelected.emit(workflow);
  }

  getStatusIconClass(statusName: string): object {
    return {
      'status-icon-completed': statusName === 'complete',
      'status-icon-in-progress': statusName === 'in-progress',
      'status-icon-error': statusName === 'error'
    };
  }

  getEmptyMesssage(): string {
    return this.searchText ? 'No workflows match' : 'No workflows';
  }

  getStatus(statusName: string): string {
    return statusName.split('-').map(part => part.substr(0, 1).toUpperCase() + part.substr(1)).join(' ');
  }

  inithWorkflowList(): void {
    this.paginator.changePage(0);
    this.filteredWorkflows = this.search(this.workflows, this.searchText);
    this.workflowsToDisplay = this.filteredWorkflows.slice(0, this.workflowsPerPage);
  }

  onPageChange(event: {first: number, rows: number}): void {
    logger.debug(`onPageChange ${JSON.stringify(event)}`);
    this.workflowsPerPage = event.rows;
    this.workflowsToDisplay = this.filteredWorkflows.slice(event.first, event.first + event.rows);
  }

  onNewWorkflowActionClicked(): void {
    this.onShowNewWorkflowDialog.emit();
  }

  onSelectionChange(workflow: Workflow | null) {
    this.selectWorkflow(workflow);
  }

  onRowsPerPageChange(newWorkflowsPerPage: number): void {
    logger.debug(`new value for workflows per page: ${newWorkflowsPerPage}, old: ${this.workflowsPerPage}`);
    setTimeout(_ => this.onPageChange({ first: this.paginator.pageIndex * newWorkflowsPerPage, rows: newWorkflowsPerPage }));
  }

  updateRowsPerPage(): void {
    logger.debug(`about to updateRowsPerPage`);
    this.grid.updateRowsPerPage();
  }

  search(workflows: Workflow[], searchText: string): Workflow[] {
    if (!workflows) {
      return [];
    }
    if (!searchText) {
      return workflows;
    }
    searchText = searchText.toLowerCase();
    return workflows.filter(workflow => {
      let value:any;
      for (var column of this.columnMetaData.columnMetaData) {
        const key:string = (column as any).columnIdentifier;
        switch (key) {
          case "statusName":
          value = this.getStatus(workflow.statusName);
          break;
          default:
          value = workflow[key];
        }
        if (typeof value == "string" && value.toLowerCase().includes(searchText)) {
          return true;
        }
      }
      return false;
    });
  }

  onSearchTextChanged(): void {
    this.inithWorkflowList();
  }

  cancelSearch(): void {
    this.searchText = null;
    this.inithWorkflowList();
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

