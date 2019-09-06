import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { FormPage, isFormPage } from '@domain/uimetadata/form-page';
import { DataObj } from '@domain/metadata/data_obj';
import { FrmdbUserEvent } from './frmdb-user-events';
import { TablePage, isTablePage } from '@domain/uimetadata/table-page';
import { Entity } from '@domain/metadata/entity';
import { FormulaHighlightedColumns } from './table.state';
import { FrmdbServerEvent } from './frmdb-server-events';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as appState from '@fe/app/state/app.state';
import { filter } from 'rxjs/operators';
import { AppServerEventAction } from '../actions/app.actions';
import { ServerEventModifiedFormData, ServerEventDeletedFormData, ServerEventModifiedTableEvent } from '@domain/event';
import { Page } from '@domain/uimetadata/page';
import { FeUser } from '@domain/user';
import { HasId } from '@domain/key_value_obj';

@Injectable({
  providedIn: 'root'
})
export class FrmdbStreamsService {

  public devMode$: Observable<boolean>;
  public readonlyMode$: Observable<boolean>;
  public entities$: Observable<Entity[]>;
  public entity$: Observable<Entity>;
  public formulaHighlightedColumns$: Observable<FormulaHighlightedColumns>;
  public autoCompleteState$: Observable<appState.AutoCompleteState>;
  public page$: Observable<Page>;
  public table$: Observable<TablePage>;
  public form$: Observable<FormPage>;
  public pageData$: Observable<HasId>;
  public user$: Observable<FeUser>;


  public userEvents$: Subject<FrmdbUserEvent> = new ReplaySubject();
  public serverEvents$: Subject<FrmdbServerEvent> = new Subject();

  constructor(protected store: Store<appState.AppState>) {
    this.devMode$ = this.store.select(appState.getDeveloperMode);
    this.readonlyMode$ = this.store.select(appState.getFormReadOnly);
    this.entities$ = this.store.select(appState.getEntitiesState);
    this.formulaHighlightedColumns$ = this.store.select(appState.getFormulaHighlightedColumns);
    this.entity$ = this.store.select(appState.getTableEntityState).pipe(filter<Entity>(x => x != null));
    this.autoCompleteState$ = this.store.select(appState.getAutoCompleteState).pipe(filter<appState.AutoCompleteState>(x => x != null));
    this.store.select(appState.getPageStateBase).subscribe(x => console.warn(x));
    this.store.select(appState.getPageState).subscribe(x => console.warn(x));
    this.page$ = this.store.select(appState.getPageState);
    this.table$ = this.page$.pipe(filter(p => isTablePage(p)));
    this.form$ = this.page$.pipe(filter(p => isFormPage(p)));
    this.pageData$ = this.store.select(appState.getPageDataState).pipe(filter<FeUser>(x => x != null));
    this.user$ = this.store.select(appState.getUser).pipe(filter<FeUser>(x => x != null));

    //TODO: remove these and use only ngrx Actions
    this.userEvents$.subscribe(userEvent => {
      switch (userEvent.type) {
        case "UserModifiedFormData":
          this.store.dispatch(new AppServerEventAction(new ServerEventModifiedFormData(userEvent.obj)));
          break;
        case "UserDeletedFormData":
          this.store.dispatch(new AppServerEventAction(new ServerEventDeletedFormData(userEvent.obj)));
          break;
        case "UserSelectedCell":
          this.store.dispatch(new appState.UserSelectCell(userEvent.columnName));
          break;
        case "UserSelectedRow":
          this.store.dispatch(new appState.UserSelectRow(userEvent.dataObj));
          break;
        case "UserModifiedTableUi":
          //FIXME: allow only the admin to change the "DEFAULT order of the table columns"
          //Currently we sending to the server an event too often time a user
          // this.store.dispatch(new AppServerEventAction(new ServerEventModifiedTableEvent(userEvent.table)));
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
