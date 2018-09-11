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
import { WorkflowStep } from '../shared/workflow-step';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-step-assignment',
  templateUrl: './workflow-step-assignment.component.html',
  styleUrls: ['./workflow-step-assignment.component.css']
})
export class WorkflowStepAssignmentComponent implements OnInit {
  @Input() step: WorkflowStep;
  constructor() { }

  ngOnInit() {
  }

}/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
