/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { NotFoundComponent } from '@fe/app/not-found/not-found.component';
import { TableComponent } from './components/table/table.component';
import { FormComponent } from './components/form/form.component';

export function getLayoutRoutes(LayoutComponentClass: any): Routes {
  return [
    {
      path: '',
      component: LayoutComponentClass,
      children: [
        {
          path: ':module__entity',
          children:[
            {
              path: '', component: TableComponent,
            },
            {
              path: ':_id', component: FormComponent,
            },
            { path: '**', component: NotFoundComponent }
          ]          
        },
      ]
    }
  ]
}

@NgModule({
  imports: [RouterModule.forChild(getLayoutRoutes(LayoutComponent))],
  exports: [RouterModule]
})
export class LightThemeRoutingModule { }
