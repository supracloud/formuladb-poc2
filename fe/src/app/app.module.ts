/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';

import { AppEffects } from './effects/app.effects';
import { BackendService } from './effects/backend.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as appState from './state/app.state';
import { ApplicationsComponent } from './applications/applications.component';
import { ApplicationComponent } from './applications/application/application.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DevModeCommonModule } from './dev-mode-common/dev-mode-common.module';
import { FormEffects } from './effects/form.effects';
import { PageComponent } from './components/page/page.component';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationsComponent,
    ApplicationComponent,
    PageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    StoreModule.forRoot(appState.reducers, { metaReducers: [appState.appMetaReducer] }),
    StoreRouterConnectingModule,
    EffectsModule.forRoot([AppEffects, FormEffects]),
    NgbModule.forRoot(),
    HttpClientModule,
    FontAwesomeModule,
    DevModeCommonModule,
  ],
  providers: [
    BackendService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
