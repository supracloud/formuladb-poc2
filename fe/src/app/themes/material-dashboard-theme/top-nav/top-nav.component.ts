import { Component, OnInit } from '@angular/core';

import { TopNavComponent as TopNavComponentBase } from '../../default-theme/top-nav/top-nav.component'
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import * as appState from '../../../app.state';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent extends TopNavComponentBase {

  constructor(store: Store<appState.AppState>, router: Router) {
    super(store, router);
  }

  ngOnInit() {
  }

}