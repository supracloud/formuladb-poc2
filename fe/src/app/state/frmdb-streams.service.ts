import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { Form } from '@core/domain/uimetadata/form';
import { DataObj } from '@core/domain/metadata/data_obj';
import { FrmdbUserEvent } from './frmdb-user-events';
import { Table } from '@core/domain/uimetadata/table';
import { Entity } from '@core/domain/metadata/entity';
import { FormulaHighlightedColumns } from './table.state';
import { FrmdbServerEvent } from './frmdb-server-events';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as appState from '@fe/app/state/app.state';
import { filter } from 'rxjs/operators';
import { AppServerEventAction } from '../actions/app.actions';
import { ServerEventModifiedFormData } from '../actions/form.backend.actions';
import { ServerEventModifiedFormDataEvent, ServerEventDeletedFormDataEvent, ServerEventModifiedTableEvent } from '@core/domain/event';
import { FormDragAction } from '../actions/form.user.actions';

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
  public autoCompleteState$: Observable<appState.AutoCompleteState>;

  public userEvents$: Subject<FrmdbUserEvent> = new ReplaySubject();
  public serverEvents$: Subject<FrmdbServerEvent> = new Subject();

  constructor(protected store: Store<appState.AppState>) {
    this.devMode$ = this.store.select(appState.getDeveloperMode);
    this.readonlyMode$ = this.store.select(appState.getFormReadOnly);
    this.entities$ = this.store.select(appState.getEntitiesState);
    this.form$ = this.store.select(appState.getFormState).pipe(filter<Form>(x => x != null));
    this.formData$ = this.store.select(appState.getFormDataState).pipe(filter<DataObj>(x => x != null));
    this.table$ = this.store.select(appState.getTableState);
    this.formulaHighlightedColumns$ = this.store.select(appState.getTableHighlightColumns);
    this.entity$ = this.store.select(appState.getTableEntityState).pipe(filter<Entity>(x => x != null));
    this.autoCompleteState$ = this.store.select(appState.getAutoCompleteState).pipe(filter<appState.AutoCompleteState>(x => x != null));

    //TODO: remove these and use only ngrx Actions
    this.userEvents$.subscribe(userEvent => {
      switch (userEvent.type) {
        case "UserDraggedFormElement":
          this.store.dispatch(new FormDragAction(userEvent.nodeElement));
          break;
        case "UserModifiedFormData":
          this.store.dispatch(new AppServerEventAction(new ServerEventModifiedFormDataEvent(userEvent.obj)));
          break;
        case "UserDeletedFormData":
          this.store.dispatch(new AppServerEventAction(new ServerEventDeletedFormDataEvent(userEvent.obj)));
          break;
        case "UserSelectedCell":
          this.store.dispatch(new appState.UserSelectCell(userEvent.columnName));
          break;
        case "UserSelectedRow":
          this.store.dispatch(new appState.UserSelectRow(userEvent.dataObj));
          break;
        case "UserModifiedTableUi":
          this.store.dispatch(new AppServerEventAction(new ServerEventModifiedTableEvent(userEvent.table)));
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
