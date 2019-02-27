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
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationSegment } from './navigation/navigation.segment';
import { TopNavComponent } from './top-nav/top-nav.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { FormTextComponent } from './theme-components'
import { TableComponent } from './theme-components'
import { FormComponent } from './theme-components'
import { VLayoutComponent } from './theme-components'
import { FormItemComponent } from './theme-components'
import { HLayoutComponent } from './theme-components'
import { AgGridModule } from 'ag-grid-angular';
import { TableHeaderComponent } from '@fe/app/table/table-header.component';
import { FormEditingService } from '@fe/app/form/form-editing.service';
import { TableService } from '@fe/app/table/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { FormTabsComponent } from './theme-components'
import { FormTableComponent } from './theme-components'
import { FormDataGridComponent } from './theme-components'
import { NotFoundComponent } from '@fe/app/not-found/not-found.component';

import { ContextMenuComponent } from '@fe/app/dev-mode-overlay/context-menu/context-menu.component';
import { FormItemEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-item-editor.component';
import { FormInputEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-input-editor/form-input-editor.component';
import { DropHandleComponent } from '@fe/app/dev-mode-overlay/drop-handle/drop-handle.component';
import { FormAutocompleteComponent } from './theme-components'
import { FormDatepickerComponent } from './theme-components'
import { FormInputComponent } from './theme-components'
import { FormTimepickerComponent } from './theme-components'
import { FormChartComponent } from './theme-components';
import { FormStateComponent } from './theme-components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AgGridModule.withComponents([TableComponent, TableHeaderComponent]),
    CrosscuttingModule,
    FontAwesomeModule,
    NgxChartsModule,
    NgxGraphModule,
    NgbModule,
    LightThemeRoutingModule,
    CrosscuttingModule,
  ],
  declarations: [
    ContextMenuComponent,
    FormItemEditorComponent,
    FormInputEditorComponent,
    DropHandleComponent,
    LayoutComponent,
    NavigationComponent,
    NavigationSegment,
    TopNavComponent,
    FormComponent,
    FormItemComponent,
    FormTextComponent,
    FormInputComponent,
    FormStateComponent,
    VLayoutComponent,
    HLayoutComponent,
    FormTabsComponent,
    FormTableComponent,
    FormDataGridComponent,
    FormAutocompleteComponent,
    FormDatepickerComponent,
    FormTimepickerComponent,
    FormChartComponent,
    NotFoundComponent,
    TableHeaderComponent,
    TableComponent,
  ],
  providers: [
    FormEditingService,
    TableService,
    I18nPipe
  ]
})
export class LightThemeModule { }
