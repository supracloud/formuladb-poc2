/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken } from '@angular/core';
import { StoreModule, ActionReducerMap } from '@ngrx/store';
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
import { FrmdbPopupDirective } from './dev-mode-common/frmdb-popup.directive';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationComponent } from './applications/application/application.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<appState.AppState>>('Registered Reducers');

export function getReducers() {
  return appState.reducers;
}

@NgModule({
  declarations: [
    AppComponent,
    FrmdbPopupDirective,
    ApplicationsComponent,
    ApplicationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    StoreModule.forRoot(REDUCER_TOKEN, { initialState: appState.getInitialState, metaReducers: [appState.appMetaReducer] }),
    StoreDevtoolsModule.instrument({
      maxAge: 50, // Retains last 25 states
      // logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreRouterConnectingModule,
    EffectsModule.forRoot([AppEffects]),
    NgbModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
  ],
  providers: [
    BackendService,
    {
      provide: REDUCER_TOKEN,
      useFactory: getReducers,
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
