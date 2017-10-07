import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';
import { EditorComponent } from './editor/editor.component';
import { ModalComponent } from './modal/modal.component';

import { environment } from '../environments/environment';

import * as appState from './app.state';

import { AppEffects } from "./app.effects";

import { FormModalService } from "./form-modal.service";
import { MockService } from "./test/mock.service";
import { BackendReadService } from "./backend-read.service";

const routes: Routes = [
  { path: ':path', component: TableComponent,
      // children: [{
      //     path: ':_id',
      //     component: MwzFormComponent
      // }]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    NavigationComponent,
    FormComponent,
    TableComponent,
    EditorComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot(appState.reducers),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects])
  ],
  exports: [RouterModule],
  providers: [MockService, FormModalService, BackendReadService, AppEffects ],
  bootstrap: [AppComponent]
})
export class AppModule { }
