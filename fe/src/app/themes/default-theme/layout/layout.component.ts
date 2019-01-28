/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { lightBootstrapDashbord } from './light-bootstrap-dashboard';
import { Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';

import * as appState from '../../../app.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'frmdb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {
  selectedEntity$: Observable<appState.Entity | undefined>;
  themeColorPalette$: Observable<string>;
  sidebarImageUrl$: Observable<string>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, protected store: Store<appState.EntityState>) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.themeColorPalette$ = this.store.select(appState.getThemeColorPalette);
    this.sidebarImageUrl$ = this.store.select(appState.getSidebarImageUrl);
  }

  ngOnInit() {
  }

  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      lightBootstrapDashbord()
    }
  }
}
