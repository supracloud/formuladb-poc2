/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
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

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(appState.reducers, { metaReducers: [appState.appMetaReducer] }),
    StoreDevtoolsModule.instrument({
      maxAge: 50, // Retains last 25 states
      // logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreRouterConnectingModule,
    EffectsModule.forRoot([AppEffects]),
    NgbModule.forRoot(),
    HttpClientModule
  ],
  providers: [
    BackendService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
