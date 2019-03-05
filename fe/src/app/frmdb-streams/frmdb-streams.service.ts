import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { Form } from '@core/domain/uimetadata/form';
import { DataObj } from '@core/domain/metadata/data_obj';
import { UserEvent, UserModifiedFormData } from './frmdb-user-events';
import { Table } from '@core/domain/uimetadata/table';
import { Entity } from '@core/domain/metadata/entity';
import { FormulaHighlightedColumns } from '../components/table/table.state';
import { ServerEvent } from './server-events';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as appState from 'src/app/app.state';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FrmdbStreamsService {

  public devMode$: Observable<boolean>;
  public readonlyMode$: Observable<boolean>;
  public entities$: Observable<Entity[]>;
  public entity$: Observable<Entity>;
  public table$: Observable<Table>;
  public formulaHighlightedColumns$: Observable<FormulaHighlightedColumns>;
  public form$: Observable<Form>;
  public formData$: Observable<DataObj>;
  public relatedAutoCompleteControls$: Observable<appState.RelatedAutoCompleteControls>;

  public userEvents$: Subject<UserEvent> = new ReplaySubject();
  public serverEvents$: Subject<ServerEvent> = new Subject();

  constructor(protected store: Store<appState.AppState>) {
    this.devMode$ = this.store.select(appState.getDeveloperMode);
    this.readonlyMode$ = this.store.select(appState.getFormReadOnly);
    this.entities$ = this.store.select(appState.getEntitiesState);
    this.form$ = this.store.select(appState.getFormState).pipe(filter<Form>(x => x != null));
    this.formData$ = this.store.select(appState.getFormDataState).pipe(filter<DataObj>(x => x != null));
    this.table$ = this.store.select(appState.getTableState);
    this.formulaHighlightedColumns$ = this.store.select(appState.getTableHighlightColumns);
    this.entity$ = this.store.select(appState.getTableEntityState).pipe(filter<Entity>(x => x != null));
    this.relatedAutoCompleteControls$ = this.store.select(appState.getRelatedAutoCompleteControls).pipe(filter<appState.RelatedAutoCompleteControls>(x => x != null));

    //TODO: remove these and use only ngrx Actions
    this.userEvents$.subscribe(userEvent => {
      switch (userEvent.type) {
        case "UserDraggedFormElement":
          this.store.dispatch(new appState.FormDragAction(userEvent.nodeElement));
          break;
        case "UserModifiedFormData":
          this.store.dispatch(new appState.ServerEventModifiedFormData(userEvent.obj));
          break;
        case "UserDeletedFormData":
          this.store.dispatch(new appState.ServerEventDeleteFormData(userEvent.obj));
          break;
        case "UserSelectedCell":
          this.store.dispatch(new appState.UserSelectCell(userEvent.columnName));
          break;
        case "UserSelectedRow":
          this.store.dispatch(new appState.UserSelectRow(userEvent.dataObj));
          break;
        case "UserModifiedTableUi":
          this.store.dispatch(new appState.ServerEventModifiedTable(userEvent.table));
          break;
        case "UserCollapsedNavItem":
          this.store.dispatch(new appState.CollapsedEntityAction(userEvent.id, userEvent.collapsed));
          break;
      }
    });
  }

  public action(action: appState.AppActions) {
    this.store.dispatch(action);
  }
}
