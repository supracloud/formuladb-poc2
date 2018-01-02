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

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FormComponent } from './form/form.component';
import { FormInputComponent } from './form/form-input.component';
import { FormAutocompleteComponent } from "./form/form-autocomplete.component";
import { FormTabsComponent } from "./form/form-tabs.component";
import { FormTableComponent } from "./form/form-table.component";
import { FormDatepickerComponent } from "./form/form-datepicker.component";
import { FormTimepickerComponent } from "./form/form-timepicker.component";
import { FormItemComponent } from "./form/form-item.component";
import { TableComponent } from './table/table.component';
import { EditorComponent } from './editor/editor.component';
import { ModalComponent } from './modal/modal.component';
import { TreeComponent } from './tree/tree.component';
import { environment } from '../environments/environment';

import * as appState from './app.state';

import { AppEffects } from "./app.effects";

import { FormModalService } from "./form-modal.service";
import { MwzParser } from "./mwz-parser";
import { PouchdbService } from "./pouchdb.service";
import { HighlightService } from './services/hightlight.service';
import { MetaItemEditorComponent } from './tree/meta-item-editor/meta-item-editor.component';
import { DragService } from './services/drag.service';
import { EditOptionsService } from './services/edit.options.service';

const routes: Routes = [
  {
    path: ':path', component: TableComponent,
  },
  {
    path: ':path/:_id', component: FormComponent,
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    NavigationComponent,
    FormComponent,
    TreeComponent,
    FormInputComponent,
    FormAutocompleteComponent,
    FormTabsComponent,
    FormTableComponent,
    FormDatepickerComponent,
    FormTimepickerComponent,
    FormItemComponent,
    TableComponent,
    EditorComponent,
    ModalComponent,
    MetaItemEditorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    StoreModule.forRoot(appState.reducers, { metaReducers: [appState.appMetaReducer] }),
    NgbModule.forRoot(),
    StoreRouterConnectingModule,
    // !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forRoot([AppEffects])
  ],
  exports: [RouterModule],
  providers: [
    FormModalService,
    MwzParser,
    PouchdbService,
    HighlightService,
    DragService,
    EditOptionsService,
    { provide: RouterStateSerializer, useClass: appState.CustomSerializer },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
