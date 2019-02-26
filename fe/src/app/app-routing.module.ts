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
    path: 'theme/argon',
    loadChildren: '../app/themes/argon-theme/argon-theme.module#ArgonThemeModule'
  },
  {
    path: 'theme/0',
    loadChildren: '../app/themes/light-theme/light-theme.module#LightThemeModule'
  },
  {
    path: 'theme/1',
    loadChildren: '../app/themes/material-dashboard-theme/material-dashboard-theme.module#MaterialDashboardThemeModule'
  },
  {
    path: 'theme/2',
    loadChildren: '../app/themes/now-uidashboard-theme/now-uidashboard-theme.module#NowUIDashboardThemeModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
