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
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

import { LightThemeRoutingModule } from './light-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationSegment } from './navigation/navigation.segment';
import { TopNavComponent } from './top-nav/top-nav.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { FormTextComponent } from './components/form-text/form_text.component';
import { TableComponent } from './components/table/table.component';
import { FormComponent } from './components/form/form.component';
import { FormVerticalLayoutComponent } from './components/form-vertical-layout/form-vertical-layout.component';
import { FormItemComponent } from './components/form-item/form-item.component';
import { FormHorizontalLayoutComponent } from './components/form-horizontal-layout/form-horizontal-layout.component';
import { AgGridModule } from 'ag-grid-angular';
import { TableHeaderComponent } from '@fe/app/table/table-header.component';
import { FormEditingService } from '@fe/app/form/form-editing.service';
import { TableService } from '@fe/app/table/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { FormTabsComponent } from './components/form-tabs/form_tabs.component';
import { FormTableComponent } from './components/form_table/form_table.component';
import { FormDataGridComponent } from './components/form_data_grid/form_data_grid.component';
import { NotFoundComponent } from '@fe/app/not-found/not-found.component';

import * as appState from '../../app.state';
import { ContextMenuComponent } from '@fe/app/dev-mode-overlay/context-menu/context-menu.component';
import { FormItemEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-item-editor.component';
import { FormInputEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-input-editor/form-input-editor.component';
import { DropHandleComponent } from '@fe/app/dev-mode-overlay/drop-handle/drop-handle.component';
import { FormAutocompleteComponent } from './components/form_autocomplete/form_autocomplete.component';
import { FormDatepickerComponent } from './components/form_datepicker/form_datepicker.component';
import { FormInputComponent } from './components/form-input/form_input.component';
import { FormTimepickerComponent } from './components/form_timepicker/form_datepicker.component';
import { FormChartComponent } from '@fe/app/form/form-chart/form-chart.component';
import { FormStateComponent } from '@fe/app/form/form-state/form-state.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    StoreModule.forRoot(appState.reducers, { metaReducers: [appState.appMetaReducer] }),
    StoreRouterConnectingModule,
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
    TableComponent,
    FormComponent,
    FormItemComponent,
    FormTextComponent,
    FormInputComponent,
    FormStateComponent,
    FormVerticalLayoutComponent,
    FormHorizontalLayoutComponent,
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
