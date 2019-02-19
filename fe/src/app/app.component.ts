/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component } from '@angular/core';
import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { ObservedValueOf, Observable } from 'rxjs';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '[style.padding]': 'bodyPadding',
  }
})
export class AppComponent {
  title = 'frmdb';
  public devMode$: Observable<boolean>;
  bodyPadding = "0 0 150px 0";
  constructor(protected store: Store<appState.AppState>) {
    this.devMode$ = this.store.select(appState.getDeveloperMode);
    this.devMode$.subscribe(devMode => devMode ? this.bodyPadding = "150px 0 0 0" : this.bodyPadding = "0 0 150px 0");
  }

  toggleDevMode() {
      this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }  
}
