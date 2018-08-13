
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { LoggerService } from '../shared/logger-service';
import { WorkflowCreationAction, WorkflowCreationActionOptions, WorkflowVariableData } from '../shared/workflow-app-launch-metadata';
import { ZosmfWorkflowService } from '../shared/zosmf-workflow-service';

@Component({
  selector: 'workflow-create',
  templateUrl: './workflow-create.component.html',
  styleUrls: ['./workflow-create.component.css'],
  providers: [],
  entryComponents: []
})
export class WorkflowCreateComponent implements OnInit {
  @Input() visible: boolean;
  @Output() viewCreateWorkflow = new EventEmitter<boolean>();
  @Output() initWorkflowList = new EventEmitter<void>();
  variables: WorkflowVariableData[] = [{ name: "storageGroup", value: "DEVG1" }];
  actionData: WorkflowCreationAction = {
    workflowName: "",
    workflowDefinitionFile: "",
    variables: [],
    system: "",
    owner: ""
  };
  actionOptions: WorkflowCreationActionOptions = {
    setOwnerToCurrentUser: true
  };
  private advancedMode: boolean = true;

  constructor(private zosmfWorkflowService: ZosmfWorkflowService,
    private loggerService: LoggerService) {

  }

  ngOnInit() {
    this.updateVariables();
  }

  private columnMetaData: any = {
    columnMetaData: [
      {
        "columnIdentifier": "name",
        "shortColumnLabel": "name",
        "longColumnLabel": "Name",
        "rawDataType": "string",
        "defaultSortDirection": "A",
        "sortType": "lexical",
        "sortableColumn": false,
        "displayHints": {
          defaultcolumnWidth: "300px"
        }
      },
      {
        "columnIdentifier": "value",
        "shortColumnLabel": "value",
        "longColumnLabel": "Value",
        "rawDataType": "string",
        "defaultSortDirection": "A",
        "sortType": "lexical",
        "sortableColumn": false,
        "displayHints": {
          defaultcolumnWidth: "300px"
        }
      },
      {
        "columnIdentifier": "delete",
        "shortColumnLabel": "delete",
        "longColumnLabel": " ",
        "rawDataType": "string",
        "defaultSortDirection": "A",
        "sortType": "lexical",
        "sortableColumn": false,
        "displayHints": {
          isCustomTemplating: true,
          defaultcolumnWidth: "30px",
          formatParameters: {
            valueMapping: "2"
          }
        }
      }]
  };

  removeRowFromVariables(row: any) {
    let index = this.variables.indexOf(row);
    this.variables = this.variables.filter((val, i) => i != index);
    row = null;
    this.updateVariables();
  }

  updateVariables() {
    let updatedArray: WorkflowVariableData[] = this.variables.filter((val, i) => val.name != "" || val.value != "");
    updatedArray.push({ name: "", value: "" });
    this.variables = updatedArray;
  }

  createWorkflow() {
    this.actionData.variables = this.variables.slice(0);
    //last element always empty and unnecessary
    this.actionData.variables.pop();
    let actionData = Object.assign({}, this.actionData);
    let actionOptions = Object.assign({}, this.actionOptions);
    this.zosmfWorkflowService.createWorkflow(actionData, actionOptions)
      .subscribe(
      data => {
        this.initWorkflowList.emit();
        this.viewCreateWorkflow.emit(false);
      },
      error => {
        this.loggerService.zosmfError(error);
        this.viewCreateWorkflow.emit(false);
      });
  }

  isIncorrectInputData(): boolean {
    return this.actionData.workflowName == '' ||
          (this.advancedMode &&
            (this.actionData.workflowDefinitionFile == '' ||
            this.actionData.system == '' ||
            (!this.actionOptions.setOwnerToCurrentUser &&
              this.actionData.owner == '')))
  }

  cancel() {
    this.viewCreateWorkflow.emit(false);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
