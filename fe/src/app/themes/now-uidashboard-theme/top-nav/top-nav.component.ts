import { Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';

import * as appState from '../../../app.state';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent  {

  constructor(store: Store<appState.AppState>) {
  }

  ngOnInit() {
  }

}
