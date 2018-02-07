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
import { FormTreeObject } from '../tree/object-impl/tree.object.form';
import { TableTreeObject } from '../tree/object-impl/tree.object.table';
import * as _ from "lodash";
import { TreeChange } from '../tree/tree.change';

@Component({
  moduleId: module.id,
  selector: 'editor',
  templateUrl: "editor.component.html",
  styleUrls: ["editor.component.scss"]
})

export class EditorComponent implements OnInit {
  subscription: Subscription = new Subscription();
  private path: string = null;
  public isForm: boolean = false;
  private table: Table;
  private tableTree: TableTreeObject;
  private form: Form;
  private formTree: FormTreeObject;

  private entityText: string;
  private formText: string;
  private tableText: string;
  private entity: Entity;
  private parserService: MwzParser;


  private editorStates: any = {
    entity: "tree",
    table: "tree",
    form: "tree"
  }

  @ViewChild('tabset')
  private tabset: NgbTabset;

  constructor(private store: Store<appState.AppState>) {
    this.parserService = new MwzParser();
  }

  public applyChanges(preview: boolean) {
    console.log("EditorComponent: isFom=", this.isForm, this.entity);
    if (this.isForm) {
      let newForm = this.parserService.parseForm(this.entity, this.formText);
      newForm.type_ = 'Form_';
      newForm._id = 'Form_:' + this.path;
      if (preview) {
        this.store.dispatch(new fromForm.FormFromBackendAction(newForm));
      } else {
        this.store.dispatch(new fromForm.UserActionEditedForm(newForm));
      }
    } else {
      let newTable = this.parserService.parseTable(this.entity, this.tableText);
      newTable.type_ = 'Table_';
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

      // if (this.isForm) {
      //   this.tabset.select('Form');
      // } else {
      //   this.tabset.select('Table');
      // }
    });

    this.store.select(fromEntity.getSelectedEntityState).subscribe(selectedEntity => {
      this.entity = selectedEntity;
      this.setText();
    });

    this.store.select(fromTable.getTableState).subscribe(table => {
      this.table = _.cloneDeep(table);
      this.tableTree = new TableTreeObject(this.table);
      this.tableTree.canDelete = false;
      this.tableTree.canEdit = false;
      this.setText();
    });

    this.store.select(fromForm.getFormState).subscribe(form => {
      this.form = _.cloneDeep(form);
      this.formTree = new FormTreeObject(this.form);
      this.formTree.canDelete = false;
      this.formTree.canEdit = false;
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

  private formChange(event: TreeChange): void {
    this.store.dispatch(new fromForm.FormFromBackendAction((event.reportingNode as FormTreeObject).item as Form));
  }


  private tableChange(event: TreeChange): void {
    this.store.dispatch(new fromTable.TableFormBackendAction((event.reportingNode as TableTreeObject).item));
  }
}
