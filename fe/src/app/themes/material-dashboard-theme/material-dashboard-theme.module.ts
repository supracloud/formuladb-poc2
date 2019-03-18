/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { MaterialDashboardThemeRoutingModule } from './material-dashboard-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { DevModeCommonModule } from 'src/app/dev-mode-common/dev-mode-common.module';
import { ComponentsModule } from '@fe/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialDashboardThemeRoutingModule,
    NgbModule,
    CrosscuttingModule,
    DevModeCommonModule,
    ComponentsModule,
  ],
  declarations: [
    LayoutComponent,
  ]
})
export class MaterialDashboardThemeModule { 
  constructor() {
    console.log("MaterialDashboardThemeModule");
  }
}
