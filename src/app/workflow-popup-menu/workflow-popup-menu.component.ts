/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnInit,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-popup-menu',
  templateUrl: './workflow-popup-menu.component.html',
  styleUrls: [
    '../css/workflow-common-styles.css',
    './workflow-popup-menu.component.css'
  ],
  animations: [
    trigger('visible', [
      state(
        'false',
        style({
          height: 0,
          overflow: 'hidden',
          padding: 0
        })
      ),
      state(
        'true',
        style({
          height: '*'
        })
      ),
      transition('false <=> true', animate('200ms linear'))
    ])
  ]
})
export class WorkflowPopupMenuComponent implements OnInit {
  @Input() position: 'left'| 'right' = 'left';
  isVisible = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    this.hide();
  }

  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent) {
    event.stopPropagation();
    this.hide();
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
