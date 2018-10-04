/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { getLayoutRoutes } from '../default-theme/default-theme-routing.module'; 

@NgModule({
  imports: [RouterModule.forChild(getLayoutRoutes(LayoutComponent))],
  exports: [RouterModule]
})
export class NowUIDashboardThemeRoutingModule {
  constructor() {
    console.log("NowUIDashboardThemeRoutingModule");
  }
}
