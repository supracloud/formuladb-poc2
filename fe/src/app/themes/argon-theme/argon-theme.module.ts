import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArgonThemeRoutingModule } from './argon-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { ComponentsModule } from '@fe/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ArgonThemeRoutingModule,
    ComponentsModule,
  ],
  declarations: [LayoutComponent]
})
export class ArgonThemeModule { }
