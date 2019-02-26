import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArgonThemeRoutingModule } from './argon-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { VerticalNavigationComponent } from './vertical-navigation/vertical-navigation.component';
import { FrmdbStreamsModule } from '@fe/app/frmdb-streams/frmdb-streams.module';

@NgModule({
  imports: [
    CommonModule,
    ArgonThemeRoutingModule,
    FrmdbStreamsModule,
  ],
  declarations: [LayoutComponent, VerticalNavigationComponent]
})
export class ArgonThemeModule { }
