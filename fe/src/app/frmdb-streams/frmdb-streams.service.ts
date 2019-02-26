import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Form } from '@core/domain/uimetadata/form';
import { DataObj } from '@core/domain/metadata/data_obj';
import { ServerEventModifiedFormDataEvent } from '@core/domain/event';

@Injectable({
  providedIn: 'root'
})
export class FrmdbStreamsService {

  public devMode$: Subject<boolean> = new Subject();
  public readonlyMode$: Subject<boolean> = new Subject();
  public form$: Subject<Form> = new Subject();
  public formData$: Subject<DataObj> = new Subject();
  public saveFormEvents$: Subject<ServerEventModifiedFormDataEvent> = new Subject();

  constructor() { }
}
