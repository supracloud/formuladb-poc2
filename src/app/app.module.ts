import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { FormGridComponent } from './form/form-grid.component';
import { FormGridRowComponent } from './form/form-grid-row.component';
import { FormGridColComponent } from './form/form-grid-col.component';
import { FormInputComponent } from './form/form-input.component';
import { FormAutocompleteComponent } from "./form/form-autocomplete.component";
import { FormTabsComponent } from "./form/form-tabs.component";
import { FormTableComponent } from "./form/form-table.component";
import { TableComponent } from './table/table.component';
import { EditorComponent } from './editor/editor.component';
import { ModalComponent } from './modal/modal.component';
import { NodeChildrenService } from "./form/node-children.service";

import { environment } from '../environments/environment';

import * as appState from './app.state';

import { AppEffects } from "./app.effects";

import { FormModalService } from "./form-modal.service";
import { MockService } from "./test/mock.service";
import { BackendReadService } from "./backend-read.service";
import { BackendWriteService } from "./backend-write.service";
import { ParserService } from "./parser.service";
import { ContainerComponent } from './container.component';

const routes: Routes = [
  { path: ':path', component: TableComponent,
      children: [{
          path: ':_id',
          component: FormComponent
      }]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    NavigationComponent,
    FormComponent,
    FormGridComponent,
    FormGridRowComponent,
    FormGridColComponent,
    FormInputComponent,
    FormAutocompleteComponent,
    FormTabsComponent,
    FormTableComponent,
    TableComponent,
    EditorComponent,
    ModalComponent,
    ContainerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot(appState.reducers),
    StoreRouterConnectingModule,
    // !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects])
  ],
  exports: [RouterModule],
  providers: [
    MockService, 
    FormModalService, 
    BackendReadService, 
    BackendWriteService,
    ParserService,
    NodeChildrenService,
    { provide: RouterStateSerializer, useClass: appState.CustomSerializer },
  ],
  entryComponents:[
    FormGridComponent,
    FormGridRowComponent,
    FormGridColComponent,
    FormInputComponent,
    FormAutocompleteComponent,
    FormTableComponent,
    FormTabsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
