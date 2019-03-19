import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArgonThemeRoutingModule } from './argon-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
  imports: [
    CommonModule,
    ArgonThemeRoutingModule,
  ],
  declarations: [LayoutComponent]
})
export class ArgonThemeModule { }
