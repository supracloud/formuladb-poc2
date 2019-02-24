/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export function getLayoutRoutes(LayoutComponentClass: any): Routes {
  return [
    {
      path: '',
      component: LayoutComponentClass,
      children: [
        {
          path: ':isStaticPage__entity',
          loadChildren: '../../frmdb/frmdb.module#FrmdbModule'
        },
      ]
    }
  ]
}

@NgModule({
  imports: [RouterModule.forChild(getLayoutRoutes(LayoutComponent))],
  exports: [RouterModule]
})
export class DefaultThemeRoutingModule { }
