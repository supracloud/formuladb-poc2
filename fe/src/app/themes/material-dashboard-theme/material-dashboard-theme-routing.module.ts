/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { getLayoutRoutes } from '../light-theme/light-theme-routing.module'; 

@NgModule({
  imports: [RouterModule.forChild(getLayoutRoutes(LayoutComponent))],
  exports: [RouterModule]
})
export class MaterialDashboardThemeRoutingModule {
  constructor() {
    console.log("MaterialDashboardThemeRoutingModule");
  }
}
