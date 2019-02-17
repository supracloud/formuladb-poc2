/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../environments/environment';

import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';

import { AppEffects } from './app.effects';
import { BackendService } from './backend.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as appState from './app.state';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationComponent } from './applications/application/application.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DevModeCommonModule } from './dev-mode-common/dev-mode-common.module';
import { FormulaEditorModule } from './formula-editor/formula-editor.module';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationsComponent,
    ApplicationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    StoreModule.forRoot(appState.reducers, { metaReducers: [appState.appMetaReducer] }),
    StoreDevtoolsModule.instrument({
      maxAge: 50, // Retains last 25 states
      // logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreRouterConnectingModule,
    EffectsModule.forRoot([AppEffects]),
    NgbModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
    FormulaEditorModule, //TODO: lazy load components from this module, e.g. https://plnkr.co/edit/ZGC82G9u10EQFYFvvRMB?p=preview
    DevModeCommonModule,
  ],
  providers: [
    BackendService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
