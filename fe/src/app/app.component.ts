/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component } from '@angular/core';
import * as appState from '@fe/app/state/app.state';
import { Store } from '@ngrx/store';
import { ObservedValueOf, Observable } from 'rxjs';
import { FrmdbStreamsService } from './state/frmdb-streams.service';
import { FeUser } from '@domain/user';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '[style.width]': '"100vw"',
    '[style.height]': '"100vh"',
    '[style.overflow]': '"hidden"',
    '[style.background]': '"none transparent"',
    '[style.padding]': 'bodyPadding',
    '[class.frmdb-dev-mode-on]': 'devMode',
  }
})
export class AppComponent {
  title = 'frmdb';
  public devMode: boolean;
  public user: FeUser | undefined;
  bodyPadding = "0 0 60px 0";

  closeDevModeIcon = faTimesCircle;

  constructor(protected store: Store<appState.AppState>, public frmdbStreams: FrmdbStreamsService) {
    this.store.select(appState.getDeveloperMode).subscribe(devMode => {
      this.devMode = devMode;
      if (devMode) {
        this.bodyPadding = "210px 0 60px 0";
      } else {
        this.bodyPadding = "0 0 60px 0";
      }
    });

    this.frmdbStreams.user$.subscribe(u => this.user = u);
  }

  toggleDevMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }
}
