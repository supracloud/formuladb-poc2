/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationsComponent } from './applications/applications.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FrmdbPageComponent } from './components/frmdb-page.component';

const routes: Routes = [
    {
        path: '', component: ApplicationsComponent,
    },
    { path: ':appName', component: FrmdbPageComponent },
    { path: ':appName/:entityName', component: FrmdbPageComponent },
    { path: ':appName/:entityName/:_id', component: FrmdbPageComponent },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
