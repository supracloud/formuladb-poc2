/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ApplicationsComponent } from './applications/applications.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationsComponent,
  },
  {
    path: ':appName/0',
    loadChildren: '../app/themes/light-theme/light-theme.module#LightThemeModule'
  },
  {
    path: ':appName/1',
    loadChildren: '../app/themes/material-dashboard-theme/material-dashboard-theme.module#MaterialDashboardThemeModule'
  },
  {
    path: ':appName/2',
    loadChildren: '../app/themes/now-uidashboard-theme/now-uidashboard-theme.module#NowUIDashboardThemeModule'
  },
  {
    path: ':appName/3',
    loadChildren: '../app/themes/argon-theme/argon-theme.module#ArgonThemeModule'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
