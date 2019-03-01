/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NowUIDashboardThemeRoutingModule } from './now-uidashboard-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DevModeCommonModule } from 'src/app/dev-mode-common/dev-mode-common.module';

@NgModule({
  imports: [
    CommonModule,
    NowUIDashboardThemeRoutingModule,
    CrosscuttingModule,
    NgbModule,
    DevModeCommonModule,
  ],
  declarations: [
    LayoutComponent,
  ]
})
export class NowUIDashboardThemeModule {
  constructor() {
    console.log("NowUIDashboardThemeModule");
  }
}
