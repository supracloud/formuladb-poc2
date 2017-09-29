import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';
import { EditorComponent } from './editor/editor.component';
import { ModalComponent } from './modal/modal.component';

const routes: Routes = [
  // { path: ':path', component: MwzTableComponent,
  //     children: [{
  //         path: ':_id',
  //         component: MwzFormComponent
  //     }]
  // },
  // { path: 'table-editor', component: MwzTableComponent },
  // { path: 'ecommerce', component: MwzEcommerceComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    FormComponent,
    TableComponent,
    EditorComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
