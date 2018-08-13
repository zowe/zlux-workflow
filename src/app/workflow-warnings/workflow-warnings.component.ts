
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
  Inject,
  Input,
  ViewChild
  } from '@angular/core';
import {
  Angular2InjectionTokens,
  Angular2PluginViewportEvents
  } from 'pluginlib/inject-resources';
import { logger } from '../shared/logger';
import { LoggerService } from '../shared/logger-service';
import { Message } from '../shared/message';
import { Observable } from 'rxjs/Observable';
import { ZluxGridComponent } from '@zlux/grid';
import { ZluxPaginatorComponent } from '@zlux/widgets';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'workflow-warnings',
  templateUrl: './workflow-warnings.component.html',
  styleUrls: [
    './workflow-warnings.component.css',
    '../css/workflow-common-styles.css'
  ]
})
export class WorkflowWarningsComponent implements AfterContentInit {
  @Input() messageObservable: Observable<Message>;
  @ViewChild('grid') grid: ZluxGridComponent;
  @ViewChild('paginator') paginator: ZluxPaginatorComponent;
  private messagesPerPage: number = 15;
  private readonly displayHints = {
    isCustomTemplating: true,
    // note: custom templating doesn't work without formatParameters
    formatParameters: {
      valueMapping: '0'
    }
  };

  private columnMetaData: any = {
    columnMetaData: [
      {
        columnIdentifier: 'code',
        shortColumnLabel: 'messageCode',
        longColumnLabel: 'Message Code',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '170px'}
      },
      {
        columnIdentifier: 'text',
        shortColumnLabel: 'description',
        longColumnLabel: 'Description',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '320px'}
      },
      {
        columnIdentifier: 'date',
        shortColumnLabel: 'date',
        longColumnLabel: 'Date',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '100px'}
      },
      {
        columnIdentifier: 'workflow',
        shortColumnLabel: 'workflow',
        longColumnLabel: 'Corresponding Workflow',
        rawDataType: 'string',
        defaultSortDirection: 'A',
        sortType: 'lexical',
        sortableColumn: true,
        displayHints: {...this.displayHints, defaultcolumnWidth: '200px'}
      }
    ]
  };
  private messages: Message[] = [];
  private filteredMessages: Message[] = [];
  private messagesToDisplay: Message[] = [];
  private searchText: string;

  constructor(
    private loggerService: LoggerService,
     @Inject(Angular2InjectionTokens.VIEWPORT_EVENTS) private viewPortEvents: Angular2PluginViewportEvents
    ) {
    loggerService.messageObservable.subscribe(message => {
      setTimeout(_ => {
        this.messages.unshift(message);
        this.initMessageList();
      }, 0);
    });
    // Uncomment next line to add test messages
    // this.addTestMessages();
  }

  ngAfterContentInit(): void {
    this.viewPortEvents.resized.subscribe(() => {
      this.updateRowsPerPage();
    });
    this.paginator.changePage(0);
  }

  update(): void {
    setTimeout(_ => this.updateRowsPerPage(), 0);
  }

  private onSearchTextChanged(): void {
    this.initMessageList();
  }

  private cancelSearch(): void {
    if (this.searchText) {
      this.searchText = null;
      this.initMessageList();
    }
  }

  private initMessageList(): void {
    this.paginator.changePage(0);
    this.filteredMessages = this.search(this.messages, this.searchText);
    this.messagesToDisplay = this.filteredMessages.slice(0, this.messagesPerPage);
  }

  private onPageChange(event: {first: number, rows: number}): void {
    logger.debug(`onPageChange ${JSON.stringify(event)}`);
    this.messagesPerPage = event.rows;
    this.messagesToDisplay = this.filteredMessages.slice(event.first, event.first + event.rows);
  }

  private onRowsPerPageChange(newMessagesPerPage: number): void {
    logger.debug(`new value for messages per page: ${newMessagesPerPage}, old: ${this.messagesPerPage}`);
    setTimeout(_ => this.onPageChange({ first: this.paginator.pageIndex * newMessagesPerPage, rows: newMessagesPerPage }));
  }

  private updateRowsPerPage(): void {
    logger.debug(`about to updateRowsPerPage`);
    this.grid.updateRowsPerPage();
  }

  private search(messages: Message[], searchText: string): Message[] {
    if (!messages) {
      return [];
    }
    if (!searchText) {
      return messages;
    }
    searchText = searchText.toLowerCase();
    return messages.filter(message => {
      return message.text.toLowerCase().includes(searchText) ||
        message.code.toLowerCase().includes(searchText) ||
        message.workflow.toLowerCase().includes(searchText) ||
        message.date.toLowerCase().includes(searchText);
    });
  }

  private getMessageType(warning: Message): string {
    const code = warning.code;
    if (code) {
      return code[code.length - 1];
    }
    return '';
  }

  private getEmptyMesssage(): string {
    if (this.searchText) {
      return 'No warnings match';
    }
    return 'No warnings';
  }

  private addTestMessages(): void {
    const codes = 'EWI';
    for (let i = 0; i < 101; i++) {
      const code = codes[i % codes.length];
      this.loggerService.warn(
        `MVDA100${i}${code} This is a test message number ${i}`,
        'test workflow name'
      );
    }
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

