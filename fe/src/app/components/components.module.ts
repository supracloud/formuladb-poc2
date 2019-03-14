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

import { FormComponent } from '@fe/app/components/form.component';
import { FormAutocompleteComponent } from '@fe/app/components/form_autocomplete/form_autocomplete.component';
import { FormDataGridComponent } from '@fe/app/components/form_data_grid/form_data_grid.component';
import { FormDatepickerComponent } from '@fe/app/components/form_datepicker/form_datepicker.component';
import { FormTableComponent } from '@fe/app/components/form_table/form_table.component';
import { FormTimepickerComponent } from '@fe/app/components/form_timepicker/form_timepicker.component';
import { GridRowComponent } from '@fe/app/components/grid_row/grid_row.component';
import { FormInputComponent } from '@fe/app/components/form_input/form_input.component';
import { FormTabsComponent } from '@fe/app/components/form_tabs/form_tabs.component';
import { FormTextComponent } from '@fe/app/components/form_text/form_text.component';
import { GridColComponent } from '@fe/app/components/grid_col/grid_col.component';
import { TableComponent } from '@fe/app/components/table/table.component';
import { FormChartComponent } from '@fe/app/components/form_chart/form_chart.component';
import { FormStateComponent } from '@fe/app/components/form_state/form_state.component';
import { CardComponent } from '@fe/app/components/card/card.component';
import { JumbotronComponent } from '@fe/app/components/jumbotron/jumbotron.component';
import { FormEnumComponent } from '@fe/app/components/form_enum/form_enum.component';
import { ListComponent } from '@fe/app/components/list/list.component';
import { GalleryComponent } from '@fe/app/components/gallery/gallery.component';
import { CalendarComponent } from '@fe/app/components/calendar/calendar.component';
import { ImageComponent } from '@fe/app/components/image/image.component';
import { IconComponent } from '@fe/app/components/icon/icon.component';
import { MediaComponent } from '@fe/app/components/media/media.component';
import { VNavComponent } from '@fe/app/components/v_nav/v_nav.component';
import { VNavSegmentComponent } from '@fe/app/components/v_nav/v_nav_segment.component';
import { HNavComponent } from '@fe/app/components/h_nav/h_nav.component';
import { TimelineComponent } from '@fe/app/components/timeline/timeline.component';
import { DropdownComponent } from '@fe/app/components/dropdown/dropdown.component';
import { VFiltersComponent } from '@fe/app/components/v_filters/v_filters.component';
import { HFiltersComponent } from '@fe/app/components/h_filters/h_filters.component';
import { ButtonComponent } from '@fe/app/components/button/button.component';
import { ButtonGroupComponent } from '@fe/app/components/button_group/button_group.component';
import { CardContainerComponent } from '@fe/app/components/card_prototype/card_container.component';
import { LightThemeRoutingModule } from '../themes/light-theme/light-theme-routing.module';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';
import { AgGridModule } from 'ag-grid-angular';
import { TableHeaderComponent } from '@fe/app/components/table/table-header.component';
import { FormEditingService } from '@fe/app/components/form-editing.service';
import { TableService } from '@fe/app/effects/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { NotFoundComponent } from '@fe/app/components/not-found/not-found.component';
import { FrmdbOnfocusDirective } from '@fe/app/dev-mode-overlay/frmdb-onfocus.directive';
import { ContextMenuComponent } from '@fe/app/dev-mode-overlay/context-menu/context-menu.component';
import { FormItemEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-item-editor.component';
import { FormInputEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-input-editor/form-input-editor.component';
import { DropHandleComponent } from '@fe/app/dev-mode-overlay/drop-handle/drop-handle.component';
import { PageItemComponent } from '@fe/app/components/page_item/page_item.component';
import { PageItemHostDirective } from '@fe/app/components/page_item/page_item_host.directive';

const pageItemComponents: any[] = [ 
  FormComponent,
  FormAutocompleteComponent,
  FormTabsComponent,
  FormTableComponent,
  FormDatepickerComponent,
  FormTimepickerComponent,
  FormChartComponent,
  FormTextComponent,
  ButtonComponent,
  ButtonGroupComponent,
  CalendarComponent,
  CardComponent,
  JumbotronComponent,
  DropdownComponent,
  FormDataGridComponent,
  FormEnumComponent,
  FormStateComponent,
  GalleryComponent,
  HFiltersComponent,
  GridRowComponent,
  HNavComponent,
  IconComponent,
  ImageComponent,
  ListComponent,
  MediaComponent,
  TimelineComponent,
  VFiltersComponent,
  GridColComponent,
  VNavComponent,
  VNavSegmentComponent,
  CardContainerComponent,
  FormInputComponent,
];

const components = pageItemComponents.concat([
  ContextMenuComponent,
  FormItemEditorComponent,
  FormInputEditorComponent,
  FrmdbOnfocusDirective,
  DropHandleComponent,
  PageItemComponent,
  PageItemHostDirective,
  NotFoundComponent,
  TableHeaderComponent,
  TableComponent,

]);

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
    LightThemeRoutingModule,
    CrosscuttingModule,
  ],
  declarations: components,
  entryComponents: pageItemComponents,
  exports: components,
  providers: [
    FormEditingService,
    TableService,
    I18nPipe
  ]
})
export class ComponentsModule { }
