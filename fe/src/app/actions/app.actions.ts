/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action } from '@ngrx/store';
import * as events from "@core/domain/event";

export const AppServerEventActionN = "[app] AppServerEventAction";
export class AppServerEventAction implements Action {
  readonly type = AppServerEventActionN;

  constructor(public event: events.MwzEvents) {
  }
}

