

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import {Http, Response, Headers} from '@angular/http';
import {Injectable} from '@angular/core';
import * as Rx from 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import {WorkflowStep} from './workflow-step';
import {WorkflowVariable} from './workflow-variable';
import {Workflow} from "./workflow";
import {WorkflowCreationAction, WorkflowCreationResponse, WorkflowCreationActionOptions} from './workflow-app-launch-metadata';
import {logger} from './logger';

@Injectable()
export class ZosmfWorkflowService {

  private userid: string;
  private baseUrl: string;
  private zosmfHost: string;
  private zosmfPort: number;

  constructor(private http: Http) {
  }

  initialize(userid: string, host: string, port: number) {
    this.zosmfHost = host;
    this.zosmfPort = port;
    this.baseUrl = `/ZLUX/plugins/com.rs.zosmf.workflows/services/zosmf`;
    this.userid = userid;
  }

  getWorkflowDetails(workflowKey: string): Observable<Workflow> {
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    const url = `${this.baseUrl}/zosmf/workflow/rest/1.0/workflows/${encodeURIComponent(workflowKey)}?returnData=steps,variables`;
    return this.http.get(url, {headers: headers})
      .map((res: Response) => new Workflow(res.json()))
      .catch(() => Observable.of(null));
  }

  getWorkflowList(): Observable<Workflow[]> {
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManagerInventory`;
    return this.http.get(url, {headers: headers})
      .mergeMap((res: Response) =>
        Rx.Observable.forkJoin(
          (res.json() as WorkflowListJson).items.reverse()
            .map((jsonworkflow: WorkflowDetailsJson) => this.getWorkflowDetails(jsonworkflow.workflowKey))
        ).map(xs => xs.filter(x => x != null)));
  }

  updateWorkflow(workflow: Workflow): Observable<any> {
    return this.getWorkflowDetails(workflow.workflowKey)
      .map((updatedWorkflow: Workflow) => {
        workflow.percentComplete = updatedWorkflow.percentComplete;
        workflow.statusName = updatedWorkflow.statusName;
        let steps = workflow.steps;
        let updatedSteps = updatedWorkflow.steps;
        for (let i = 0; i < steps.length; i++) {
          steps[i].state = updatedSteps[i].state;
          steps[i].instructions = updatedSteps[i].instructions;
          steps[i].specificAction = updatedSteps[i].specificAction;
        }
      });
  }

  // substituteVariablesIntoTemplates fills in all templates(instructions, JCL, etc.) in a step.
  substituteVariablesIntoTemplates(step: WorkflowStep): Observable<any> {
    const workflow = step.workflow;
    let jsonRequest = {
      "workflowKey": workflow.workflowKey,
      "step": step.name,
      "definitions": [],
      "templateSub": step.templateSub,
      "instructionsSub": step.instructionsSub,
      "saveAsDatasetSub": step.saveAsDatasetSub,
      "saveAsUnixFileSub": step.saveAsUnixFileSub,
      "outPutSub": step.outPutSub,
      "outPut": step.outPut,
      "saveAsDataset": step.saveAsDataset,
      "saveAsUnixFile": step.saveAsUnixFile,
      "submitAs": step.submitAs,
      "requestFromInstance": false
    };
    const workflowVariables: WorkflowVariable[] = workflow.variables || [];
    for (let i = 0; i < workflowVariables.length; i++) {
      const workflowVariable = workflowVariables[i];
      jsonRequest.definitions.push({
        scope: workflowVariable.scope,
        name: workflowVariable.name,
        value: workflowVariable.value,
        type: workflowVariable.type,
        useDefault: false
      });
    }
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/filebuilder/`;
    const data = 'serializedObject=' + encodeURIComponent(JSON.stringify(jsonRequest));
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(url, data, {headers: headers})
      .map((res: Response) => res.json())
      .map((jsonResponse: VariableSubstititionJson) => {
        logger.debug(`perform template ${jsonResponse.template}`);
        logger.debug(`perform definitions ${jsonResponse.definitions}`);
        step.wizard.performTemplate = jsonResponse.template;
        step.wizard.performDefinitions = jsonResponse.definitions;
        step.wizard.updateFileContents();
      });
  }

  // saveVariablesAndFinishSimpleStep sends new values for variables to Z/osmf
  // and marks a step as finished.
  saveVariablesAndFinishSimpleStep(step: WorkflowStep): Observable<any> {
    const workflow = step.workflow;
    let jsonRequest = {
      "workflowKey": workflow.workflowKey,
      "step": step.name,
      "wizardLocation": null,
      "workflowJclJobCard": null,
      "submitAs": null,
      "finished": true,
      "fileContents": null,
      "saveEditedFile": false,
      "maxLrecl": null,
      "canMarkAsFailed": false,
      "markStepAs": "NONE",
      "scope": "",
      "fileTemplatePath": null,
      "regionSize": null,
      "procName": null,
      "definitions": []
    };
    let workflowVariables: WorkflowVariable[] = workflow.variables || [];
    for (let i = 0; i < workflowVariables.length; i++) {
      const workflowVariable = workflowVariables[i];
      jsonRequest.definitions.push({
        scope: workflowVariable.scope,
        name: workflowVariable.name,
        value: workflowVariable.value,
        type: workflowVariable.type,
        useDefault: false
      });
    }
    logger.info(`substituteVariables: about to send request ${JSON.stringify(jsonRequest, null, 2)}`);
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/variables/`;
    const data = JSON.stringify(jsonRequest);
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put(url, data, {headers: headers})
      .map((res: Response) => res.json());
  }

  createWorkflow(request: WorkflowCreationAction, options?: WorkflowCreationActionOptions): Observable<WorkflowCreationResponse> {
    this.addTimestampToWorkflowCreationAction(request);
    request.system = request.system.toUpperCase();
    this.processWorkflowCreationActionOptions(request, options);
    const url = `${this.baseUrl}/zosmf/workflow/rest/1.0/workflows/`;
    const data = JSON.stringify(request);
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/json');
    logger.info(`about to send request ${JSON.stringify(data)}`);
    return this.http.post(url, data, {headers: headers})
      .map((res: Response) => res.json());
  }

  addTimestampToWorkflowCreationAction(request: WorkflowCreationAction): void {
    const dateString = ' (' + (new Date()).toDateString() + " " + (new Date()).toLocaleTimeString() + ')';
    request.workflowName += dateString;
  }

  processWorkflowCreationActionOptions(request: WorkflowCreationAction, options?: WorkflowCreationActionOptions): void {
    if (options && options.setOwnerToCurrentUser) {
      request.owner = this.userid;
    }
    if (!request.owner) {
      request.owner = this.userid;
    }
  }

  submitJob(step: WorkflowStep): Observable<any> {
    const workflow = step.workflow;
    const jclJobCards = step.wizard.performTemplate;
    const definitions = step.wizard.performDefinitions;
    const workflowJclJobCard = step.wizard.jobCards;
    const fileContents = step.wizard.fileContents;
    let jsonRequest = {
      "workflowKey": workflow.workflowKey,
      "step": step.name,
      "wizardLocation": null,
      "workflowJclJobCard": workflowJclJobCard,
      "submitAs": "JCL",
      "finished": true,
      "fileContents": fileContents,
      "saveEditedFile": false,
      "maxLrecl": "130",
      "canMarkAsFailed": false,
      "markStepAs": "NONE",
      "scope": "",
      "definitions": JSON.parse(definitions),
      "submitFile": true
    };
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/variables/`;
    const data = JSON.stringify(jsonRequest);
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put(url, data, {headers: headers})
      .map((res: Response) => res.json())
  }

  getJobStatus(step: WorkflowStep, fileIds?: string[]): Observable<JobSubmitionResponse> {
    const workflow = step.workflow;
    let jsonRequest: any = {
      "workflowKey": workflow.workflowKey,
      "step": step.name
    };
    if (fileIds) {
      jsonRequest['fileIds'] = fileIds;
    }
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/jcl/`;
    const data = "serializedObject=" + encodeURIComponent(JSON.stringify(jsonRequest));
    const headers = new Headers();
    //headers.append('Authorization', this.basicAuth);
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(url, data, {headers: headers})
      .map((res: Response) => (res.json() as JobSubmitionResponse))
  }

  getJobStatusWithFiles(step: WorkflowStep): Observable<JobSubmitionResponse> {
    return this.getJobStatus(step)
      .mergeMap((status: JobSubmitionResponse) => {
        logger.debug(`In case when no jobfiles on the response create an empty array`);
        if (!Array.isArray(status.jobfiles)) {
          status.jobfiles = [];
          status.spoolfiles = {};
          return Observable.of(status);
        }
        return this.getJobStatus(step, status.jobfiles.map(jobfile => jobfile.id.toString()))
          .map((status2: JobSubmitionResponse) => {
            status2.jobstatus = status.jobstatus;
            status2.jobfiles = status.jobfiles;
            return status2;
          })
          .map(res => {
            logger.debug(`getJobStatusWithFiles returned ${JSON.stringify(res)}`);
            let jobfiles = res.jobfiles || [];
            let spoolfiles = res.spoolfiles || {};
            for (let i = 0; i < jobfiles.length; i++) {
              if (spoolfiles[jobfiles[i].id]) {
                jobfiles[i].spoolFile = spoolfiles[jobfiles[i].id].spoolFile;
              }
            }
            step.wizard.performJobstatus = res.jobstatus;
            step.wizard.performJobfiles = res.jobfiles;
            logger.info(`performJobstatus ${JSON.stringify(step.wizard.performJobstatus, null, 2)}`);
            logger.info(`performJobfiles ${JSON.stringify(step.wizard.performJobfiles, null, 2)}`);
            step.wizard.newStepState = res.stepState;
            return res;
          });
      });
  }

  submitAndGetJobStatusWithFiles(step: WorkflowStep): Observable<JobSubmitionResponse> {
    return this.submitJob(step)
      .mergeMap(() => this.getJobStatusWithFiles(step))
      .do(res => logger.info(`submitAndGetJobStatusWithFiles returned ${JSON.stringify(res)}`));
  }

  getJobStatement(step: WorkflowStep): Observable<string> {
    const workflow = step.workflow;
    const jsonRequest = {
      'workflowKey': workflow.workflowKey,
      'step': step.name,
      'needGetJobcard': true,
      'templateSub': true
    };
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/filebuilder/`;
    const data = 'serializedObject=' + encodeURIComponent(JSON.stringify(jsonRequest));
    const headers = new Headers();
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(url, data, {headers: headers})
      .map((res: Response) => res.json() as JobStatementResponse)
      .map(jobStatmentResponse => jobStatmentResponse.jobStatement)
      .do(jobStatement => logger.info(`jobStatement: ${jobStatement}`))
      .do(jobStatement => step.wizard.jobCards = jobStatement)
  }

  overrideCompleteStep(step: WorkflowStep, comment?: string): Observable<void> {
    return this.changeStepState(step, StepState.OverrideComplete, comment);
  }

  skipStep(step: WorkflowStep, comment?: string): Observable<void> {
    return this.changeStepState(step, StepState.Skipped, comment);
  }

  acceptStep(step: WorkflowStep, comment?: string): Observable<void> {
    return this.changeStepState(step, StepState.Ready, comment);
  }

  returnStep(step: WorkflowStep, comment?: string): Observable<void> {
    return this.changeStepState(step, StepState.Assigned, comment);
  }

  private changeStepState(step: WorkflowStep, newState: StepState, comment?: string): Observable<void> {
    const workflow = step.workflow;
    const jsonRequest = {
      'workflowKey': workflow.workflowKey,
      'workflowName': workflow.workflowName,
      'steps': [step.name],
      // WorkflowComment key begins with a capital W, this is not a mistake
      // Other keys begin with a lowercase letter
      'WorkflowComment': comment || '',
      'workflowState': String(newState)
    };
    const url = `${this.baseUrl}/zosmf/workflow/WorkflowManager/workflowStateChange/`;
    const data = JSON.stringify(jsonRequest);
    const headers = new Headers();
    headers.append('ZOSMF-host', this.zosmfHost);
    headers.append('ZOSMF-port', this.zosmfPort.toString());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put(url, data, {headers: headers})
      .mergeMap(() => this.updateWorkflow(step.workflow))
      .map((res: Response) => res.json());
  }

  getJobStatementAndSubstituteVariablesIntoTemplates(step: WorkflowStep): Observable<any> {
    return this.getJobStatement(step).mergeMap(_ => this.substituteVariablesIntoTemplates(step));
  }

}

interface WorkflowListJson {
  items: WorkflowDetailsJson[];
}

interface WorkflowDetailsJson {
  workflowKey: string;
}

interface VariableSubstititionJson {
  template?: string;
  definitions?: string;
}

interface JobSubmitionResponse {
  jobfiles?: JobFile[];
  jobstatus?: JobStatus;
  spoolfiles?: SpoolFiles;
  stepState?: string;
}

export interface JobFile {
  id: string;
  ddname?: string;
  spoolFile?: string;
}

interface SpoolFiles {
  [id: string]: SpoolFile;
}

export interface JobStatus {
  [id: string]: string;
}

interface SpoolFile {
  spoolFile: string;
}

interface JobStatementResponse {
  jobStatement: string;
}

// Numeric codes for z/OSMF Workflow step states
enum StepState {
  Ready = 1,
  OverrideComplete = 5,
  Assigned = 7,
  Skipped = 8,
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

