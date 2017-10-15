import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';

import * as appState from './app.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';

import { BackendReadService } from "./backend-read.service";

@Injectable()
export class BackendWriteService {

  constructor(private store: Store<appState.AppState>) { }

  public setFormData(obj: fromForm.DataObj, property: string, value: any) {

  }
}
