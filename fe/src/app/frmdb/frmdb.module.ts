/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AgGridModule } from 'ag-grid-angular';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { FrmdbRoutingModule } from './frmdb-routing.module';
import { NotFoundComponent } from '../not-found/not-found.component';
import { FormInputComponent } from '../form/form_input/form_input.component';
import { FormAutocompleteComponent } from '../form/form_autocomplete/form_autocomplete.component';
import { FormTabsComponent } from '../form/form_tabs/form_tabs.component';
import { FormItemComponent } from '../form/form_item/form_item.component';
import { FormTimepickerComponent } from '../form/form_timepicker/form_timepicker.component';
import { FormDatepickerComponent } from '../form/form_datepicker/form_datepicker.component';
import { FormTableComponent } from '../form/form_table/form_table.component';
import { FormDataGridComponent } from '../form/form_data_grid/form_data_grid.component';
import { FormEditingService } from '../form/form-editing.service';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';
import { DropHandleComponent } from '../form/drop-handle/drop-handle.component';
import { FormHorizontalLayoutComponent } from '../form/form-horizontal-layout/form-horizontal-layout.component';
import { FormVerticalLayoutComponent } from '../form/form-vertical-layout/form-vertical-layout.component';
import { ContextMenuComponent } from '../form/context-menu/context-menu.component';
import { TableHeaderComponent } from '../table/table-header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormStateComponent } from '../form/form-state/form-state.component';
import { FormChartComponent } from '../form/form-chart/form-chart.component';
import { FrmdbOnfocusDirective } from '../form/frmdb-onfocus.directive';
import { TableService } from '../table/table.service';
import { FormItemEditorComponent } from '../form/form-item-editor/form-item-editor.component';
import { FormInputEditorComponent } from '../form/form-item-editor/form-input-editor/form-input-editor.component';
import { I18nPipe } from '../crosscutting/i18n/i18n.pipe';
import { FormTextComponent } from '../form/form-text/form_text.component';
import { DevModeCommonModule } from '../dev-mode-common/dev-mode-common.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AgGridModule.withComponents([TableHeaderComponent]),
    CrosscuttingModule,
    FontAwesomeModule,
    NgxChartsModule,
    NgxGraphModule,
    NgbModule,
    DevModeCommonModule
  ],
  declarations: [
    NotFoundComponent,
    TableHeaderComponent,
    FormInputComponent,
    FormStateComponent,
    FormAutocompleteComponent,
    FormTableComponent,
    FormDataGridComponent,
    FormDatepickerComponent,
    FormTimepickerComponent,
    FormChartComponent,
    DropHandleComponent,
    ContextMenuComponent,
    FrmdbOnfocusDirective,
    FormItemEditorComponent,
    FormInputEditorComponent,
    FormTextComponent
  ],
  providers: [
    FormEditingService,
    TableService,
    I18nPipe
  ],
  exports: [
    NotFoundComponent,
    TableHeaderComponent,
    FormInputComponent,
    FormStateComponent,
    FormAutocompleteComponent,
    FormTableComponent,
    FormDataGridComponent,
    FormDatepickerComponent,
    FormTimepickerComponent,
    FormChartComponent,
    DropHandleComponent,
    ContextMenuComponent,
    FrmdbOnfocusDirective,
    FormItemEditorComponent,
    FormInputEditorComponent,
    FormTextComponent
  ]
})
export class FrmdbModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FrmdbModule,
      providers: [FormEditingService,
        TableService,
        I18nPipe]
    };
  }
}
