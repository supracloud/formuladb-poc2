/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { LightThemeRoutingModule } from './light-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { FormEditingService } from '@fe/app/components/form-editing.service';
import { TableService } from '@fe/app/effects/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { ComponentsModule } from '@fe/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CrosscuttingModule,
    FontAwesomeModule,
    NgxChartsModule,
    NgxGraphModule,
    LightThemeRoutingModule,
    CrosscuttingModule,
    ComponentsModule,
  ],
  declarations: [
    LayoutComponent,
  ],
  providers: [
    FormEditingService,
    TableService,
    I18nPipe
  ]
})
export class LightThemeModule { }
