/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '0',
    pathMatch: 'full'
  },
  {
    path: '0',
    loadChildren: '../app/themes/default-theme/default-theme.module#DefaultThemeModule'
  },
  {
    path: '1',
    loadChildren: '../app/themes/material-dashboard-theme/material-dashboard-theme.module#MaterialDashboardThemeModule'
  },
  {
    path: '2',
    loadChildren: '../app/themes/now-uidashboard-theme/now-uidashboard-theme.module#NowUIDashboardThemeModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
