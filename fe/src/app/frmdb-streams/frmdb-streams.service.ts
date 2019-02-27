import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { Form } from '@core/domain/uimetadata/form';
import { DataObj } from '@core/domain/metadata/data_obj';
import { ServerEventModifiedFormDataEvent } from '@core/domain/event';
import { UserEvent } from './frmdb-user-events';
import { Table } from '@core/domain/uimetadata/table';
import { Entity } from '@core/domain/metadata/entity';
import { FormulaHighlightedColumns } from '../table/table.state';

@Injectable({
  providedIn: 'root'
})
export class FrmdbStreamsService {

  public devMode$: Subject<boolean> = new ReplaySubject();
  public readonlyMode$: Subject<boolean> = new ReplaySubject();
  public entity$: Subject<Entity> = new ReplaySubject();
  public table$: Subject<Table> = new ReplaySubject();
  public formulaHighlightedColumns$: Subject<FormulaHighlightedColumns> = new ReplaySubject();
  public form$: Subject<Form> = new ReplaySubject();
  public formData$: Subject<DataObj> = new ReplaySubject();
  public userEvents$: Subject<UserEvent> = new ReplaySubject();

  constructor() { }
}
