import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import * as appState from "../app.state";
import { DataObj } from "../domain/metadata/data_obj";
export { DataObj };//FIXME: how do I re-export here appState.DataObj ?

@Injectable()
export class TableService {
  public table$: Observable<appState.Table>;
  public data$: Observable<appState.DataObj[]>;

  constructor() { }

}
