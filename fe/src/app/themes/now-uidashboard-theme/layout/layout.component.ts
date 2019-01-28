/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { nowUiDashboardJs } from './now-ui-dashboard';

@Component({
  selector: 'frmdb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log("LayoutComponent");
  }

  ngOnInit() {
    console.log("LayoutComponent init");
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      nowUiDashboardJs();
    }
  }
}
