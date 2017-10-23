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
      <textarea name="text" class="editor form" [(ngModel)]='text'></textarea>
  </form>
  `,
})

export class EditorComponent implements OnInit {
  subscription: Subscription = new Subscription();
  private path: string;
  public isForm: boolean = false;

  private text: string;
  private form: Form;
  private table: Table;

  constructor(private store: Store<appState.AppState>, private parserService: ParserService) {
  }

  public applyChanges() {
    console.log("EditorComponent: isFom=", this.isForm);
    if (this.isForm) {
      let newForm = this.parserService.parseForm(this.text);
      newForm._type = 'Form_';
      newForm._id = 'Form_:' + this.path;
      this.store.dispatch(new fromForm.FormChangesAction(newForm));
    } else {
      let newTable = this.parserService.parseTable(this.text);
      newTable._type = 'Table_';
      newTable._id = 'Table_:' + this.path;
      this.store.dispatch(new fromTable.TableChangesAction(newTable));
    }
  }

  private setText() {
    if (this.isForm && null != this.form) {
      this.text = this.parserService.serializeForm(this.form);
    }
    else if (!this.isForm && null != this.table) {
      this.text = this.parserService.serializeTable(this.table);
    }
  }

  ngOnInit() {
    let cmp = this;

    this.store.select(s => s.router).subscribe(router => {
      if (null == router || null == router.state) return;
      let { path, id } = appState.parseUrl(router.state.url);
      this.isForm = (id != null);
      this.path = path;
      this.setText(); 
    });

    this.store.select(fromForm.getFormState).subscribe(frm => {
      this.form = frm;
      this.setText(); 
    });
    this.store.select(fromTable.getTableState).subscribe(tbl => {
      this.table = tbl;
      this.setText(); 
    });
  }

  ngOnDestroy() {
    //TODO: cleanup
  }
}
