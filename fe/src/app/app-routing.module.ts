/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
    {
        path: '', component: AppComponent,
    },
    { path: ':appName', component: AppComponent },
    { path: ':appName/:entityName', component: AppComponent },
    { path: ':appName/:entityName/:_id', component: AppComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
