/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationsComponent } from './applications/applications.component';
import { PageComponent } from './components/page/page.component';
import { FormComponent } from './components/form.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TableContainerComponent } from './components/table-container/table_container.component';

const routes: Routes = [
    {
        path: '', component: ApplicationsComponent,
    },
    {
        path: ':appName', component: PageComponent,
        children: [
            { path: ':entityName', component: TableContainerComponent },
            { path: ':entityName/:_id', component: FormComponent }
        ]

    },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
