import {
  Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
  ChangeDetectionStrategy
} from '@angular/core';

import { NgbTabset } from "@ng-bootstrap/ng-bootstrap";

import { Entity } from '../domain/metadata/entity';
import { Form } from '../domain/uimetadata/form';
import { Table } from '../domain/uimetadata/table';
import { Subscription } from 'rxjs/Subscription';
import { MwzParser } from '../mwz-parser';

import { Store } from '@ngrx/store';
import * as appState from '../app.state';
import * as fromForm from '../form/form.state';
import * as fromTable from '../table/table.state';
import * as fromEntity from '../entity-state';

@Component({
  moduleId: module.id,
  selector: 'editor',
  template: `
  <form class="mwz-editor mwz-independent-scroll ml-2">
    <label>{{isForm ? 'Form' : 'Table'}}</label> <button (click)="applyChanges(false)">Apply</button><button (click)="applyChanges(true)">Preview</button>
    <ngb-tabset #tabset="ngbTabset">
        <ngb-tab id="Entity" title="Entity">
          <ng-template ngbTabContent>
            <textarea cols="120" wrap="off" name="entityText" class="editor form" [(ngModel)]='entityText'></textarea>
          </ng-template>
        </ngb-tab>
        <ngb-tab id="Table" title="Table">
          <ng-template ngbTabContent>
            <textarea cols="120" wrap="off" name="formText" class="editor form" [(ngModel)]='tableText'></textarea>
          </ng-template>
        </ngb-tab>
        <ngb-tab id="Form" title="Form">
          <ng-template ngbTabContent>
            <textarea cols="120" wrap="off" name="tableText" class="editor form" [(ngModel)]='formText'></textarea>
          </ng-template>
        </ngb-tab>
      </ngb-tabset>  
  </form>
  `,
})

export class EditorComponent implements OnInit {
  subscription: Subscription = new Subscription();
  private path: string = null;
  public isForm: boolean = false;
  private table: Table;
  private form: Form;

  private entityText: string;
  private formText: string;
  private tableText: string;
  private entity: Entity;
  private parserService: MwzParser;

  @ViewChild('tabset')
  private tabset: NgbTabset;

  constructor(private store: Store<appState.AppState>) {
    this.parserService = new MwzParser();
  }

  public applyChanges(preview: boolean) {
    console.log("EditorComponent: isFom=", this.isForm, this.entity);
    if (this.isForm) {
      let newForm = this.parserService.parseForm(this.entity, this.formText);
      newForm.mwzType = 'Form_';
      newForm._id = 'Form_:' + this.path;
      if (preview) {
        this.store.dispatch(new fromForm.FormFromBackendAction(newForm));
      } else {
        this.store.dispatch(new fromForm.UserActionEditedForm(newForm));
      }
    } else {
      let newTable = this.parserService.parseTable(this.entity, this.tableText);
      newTable.mwzType = 'Table_';
      newTable._id = 'Table_:' + this.path;
      if (preview) {
        this.store.dispatch(new fromTable.TableFormBackendAction(newTable));
      } else {
        this.store.dispatch(new fromTable.UserActionEditedTable(newTable));
      }
    }
  }

  ngOnInit() {
    let cmp = this;

    this.store.select(state => state.router ? state.router.state : null).subscribe(routerState => {
      if (!routerState) return;
      let { path, id } = appState.parseUrl(routerState.url);
      this.isForm = (id != null);
      this.path = path;
      this.setText();

      if (this.isForm) {
        this.tabset.select('Form');
      } else {
        this.tabset.select('Table');
      }
    });

    this.store.select(fromEntity.getSelectedEntityState).subscribe(selectedEntity => {
      this.entity = selectedEntity
      this.setText();
    });

    this.store.select(fromTable.getTableState).subscribe(table => {
      this.table = table;
      this.setText();
    });

    this.store.select(fromForm.getFormState).subscribe(form => {
      this.form = form;
      this.setText();
    });

  }

  private setText() {
    if (this.path && this.entity && !this.isForm && this.table) {
      this.entityText = this.parserService.serializeEntity(this.entity);
    }
    if (this.path && this.entity && !this.isForm && this.table) {
      this.tableText = this.parserService.serializeTable(this.entity, this.table);
    }
    if (this.path && this.entity && this.isForm && this.form) {
      this.formText = this.parserService.serializeForm(this.entity, this.form);
    }
  }

  ngOnDestroy() {
    //TODO: cleanup
  }
}
