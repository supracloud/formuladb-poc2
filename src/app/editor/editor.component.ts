import {
  Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Entity } from '../domain/metadata/entity';
import { Form } from '../domain/uimetadata/form';
import { Table } from '../domain/uimetadata/table';
import { Subscription } from 'rxjs/Subscription';
import { ParserService } from '../parser.service';

import { Store } from '@ngrx/store';
import * as appState from '../app.state';
import * as fromForm from '../form/form.state';
import * as fromTable from '../table/table.state';

@Component({
  moduleId: module.id,
  selector: 'editor',
  template: `
  <form (ngSubmit)="applyChanges()" class="mwz-editor mwz-independent-scroll ml-2">
      <label>{{isForm ? 'Form' : 'Table'}}</label> <button type="submit">Apply Changes</button>
      <textarea cols="120" wrap="off" name="text" class="editor form" [(ngModel)]='text'></textarea>
  </form>
  `,
})

export class EditorComponent implements OnInit {
  subscription: Subscription = new Subscription();
  private path: string;
  public isForm: boolean = false;

  private text: string;
  private entity: Entity;

  constructor(private store: Store<appState.AppState>, private parserService: ParserService) {
  }

  public applyChanges() {
    console.log("EditorComponent: isFom=", this.isForm);
    if (this.isForm) {
      let newForm = this.parserService.parseForm(this.entity, this.text);
      newForm.mwzType = 'Form_';
      newForm._id = 'Form_:' + this.path;
      this.store.dispatch(new fromForm.FormChangesAction(newForm));
    } else {
      let newTable = this.parserService.parseTable(this.entity, this.text);
      newTable.mwzType = 'Table_';
      newTable._id = 'Table_:' + this.path;
      this.store.dispatch(new fromTable.TableChangesAction(newTable));
    }
  }

  ngOnInit() {
    let cmp = this;

    this.store.subscribe(state => {
      if (null == state.router || null == state.router.state) return;
      let { path, id } = appState.parseUrl(state.router.state.url);
      this.isForm = (id != null);
      this.path = path;
      let form = state.form.form;
      let table = state.table.table;
      this.entity = state.nav.selectedEntity;
      if (this.isForm && null != form) {
        this.text = this.parserService.serializeForm(this.entity, form);
      }
      else if (!this.isForm && null != table) {
        this.text = this.parserService.serializeTable(this.entity, table);
      }
    });

  }

  ngOnDestroy() {
    //TODO: cleanup
  }
}
