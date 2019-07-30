/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken, Injector } from '@angular/core';
import { StoreModule, ActionReducerMap } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';

import { AgGridModule } from 'ag-grid-angular';

import { AppEffects } from './effects/app.effects';
import { BackendService } from './effects/backend.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as appState from './state/app.state';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DevModeCommonModule } from './dev-mode-common/dev-mode-common.module';
import { FormEffects } from './effects/form.effects';

import { DataGridComponent } from './elements/data-grid/data-grid.component';
import { TableHeaderComponent } from './elements/data-grid/table-header.component';
import { TableFpatternRenderer } from './elements/data-grid/table-fpattern.component';
import { TableToolsComponent } from './elements/data-grid/table-tools.component';
import { I18nPipe } from './crosscutting/i18n/i18n.pipe';
import { CrosscuttingModule } from './crosscutting/crosscutting.module';
import { AutoLayoutService } from './elements/auto-layout.service';

export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<appState.AppState>>('Registered Reducers');

export function getReducers() {
  return appState.reducers;
}

@NgModule({
  declarations: [
    AppComponent,
    DataGridComponent, TableHeaderComponent, TableFpatternRenderer, TableToolsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    StoreModule.forRoot(REDUCER_TOKEN, { initialState: appState.getInitialState, metaReducers: [appState.appMetaReducer] }),
    StoreRouterConnectingModule,
    AgGridModule.withComponents([DataGridComponent, TableHeaderComponent, TableFpatternRenderer, TableToolsComponent]),
    EffectsModule.forRoot([AppEffects, FormEffects]),
    NgbModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
    DevModeCommonModule,
    CrosscuttingModule,
  ],
  entryComponents: [DataGridComponent, TableHeaderComponent, TableFpatternRenderer, TableToolsComponent],
  providers: [
    // InjectionService,
    BackendService,
    {
      provide: REDUCER_TOKEN,
      useFactory: getReducers,
    },
    AutoLayoutService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    const PopupElement = createCustomElement(DataGridComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('popup-element', PopupElement);    
  }
}
