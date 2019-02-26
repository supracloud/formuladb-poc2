/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component } from '@angular/core';
import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { ObservedValueOf, Observable } from 'rxjs';
import { FrmdbStreamsService } from './frmdb-streams/frmdb-streams.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    // '[style.padding]': 'bodyPadding',
  }
})
export class AppComponent {
  title = 'frmdb';
  public devMode$: Observable<boolean>;
  bodyPadding = "0 0 32px 0";
  constructor(protected store: Store<appState.AppState>, protected frmdbStreams: FrmdbStreamsService) {
    this.devMode$ = this.store.select(appState.getDeveloperMode);
    this.devMode$.subscribe(devMode => {
      if (devMode) {
        this.frmdbStreams.devMode$.next(true);
        this.bodyPadding = "32px 0 0 0";
      } else {
        this.frmdbStreams.devMode$.next(false);
        this.bodyPadding = "0 0 32px 0";
      }
    });

    frmdbStreams.userEvents$.subscribe(userEvent => {
      switch (userEvent.type) {
        case "UserDraggedFormElement":
          this.store.dispatch(new appState.FormDragAction(userEvent.nodeElement));
          break;
        case "UserModifiedFormData":
          this.store.dispatch(new appState.ServerEventModifiedFormData(userEvent.obj));
          break;
      }
    });

    this.store.select(appState.getFormReadOnly).subscribe(readOnly => frmdbStreams.readonlyMode$.next(readOnly));
    this.store.select(appState.getFormState).subscribe(form => frmdbStreams.form$.next(form!));
    this.store.select(appState.getFormDataState).subscribe(formData => frmdbStreams.formData$.next(formData!));

  }

  toggleDevMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }
}
