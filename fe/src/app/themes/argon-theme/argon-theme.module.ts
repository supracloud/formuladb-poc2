import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArgonThemeRoutingModule } from './argon-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { FrmdbStreamsModule } from '@fe/app/frmdb-streams/frmdb-streams.module';

@NgModule({
  imports: [
    CommonModule,
    ArgonThemeRoutingModule,
    FrmdbStreamsModule,
  ],
  declarations: [LayoutComponent]
})
export class ArgonThemeModule { }
