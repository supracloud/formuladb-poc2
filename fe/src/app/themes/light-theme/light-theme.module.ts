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
import { FormTextComponent, VNavSegmentComponent, CardContainerComponent } from './theme-components'
import { TableComponent } from './theme-components'
import { FormComponent } from './theme-components'
import { VLayoutComponent } from './theme-components'
import { FormItemComponent } from './theme-components'
import { HLayoutComponent } from './theme-components'
import { AgGridModule } from 'ag-grid-angular';
import { TableHeaderComponent } from '@fe/app/components/table/table-header.component';
import { FormEditingService } from '@fe/app/components/form-editing.service';
import { TableService } from '@fe/app/components/table/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { NotFoundComponent } from '@fe/app/not-found/not-found.component';
import { FrmdbOnfocusDirective } from '@fe/app/dev-mode-overlay/frmdb-onfocus.directive';
import { ContextMenuComponent } from '@fe/app/dev-mode-overlay/context-menu/context-menu.component';
import { FormItemEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-item-editor.component';
import { FormInputEditorComponent } from '@fe/app/dev-mode-overlay/form-item-editor/form-input-editor/form-input-editor.component';
import { DropHandleComponent } from '@fe/app/dev-mode-overlay/drop-handle/drop-handle.component';

import { FormTabsComponent } from './theme-components'
import { FormTableComponent } from './theme-components'
import { FormDataGridComponent } from './theme-components'
import { FormAutocompleteComponent } from './theme-components'
import { FormDatepickerComponent } from './theme-components'
import { FormInputComponent } from './theme-components'
import { FormTimepickerComponent } from './theme-components'
import { FormChartComponent } from './theme-components';
import { FormStateComponent } from './theme-components';
import { CardComponent } from './theme-components';
import { FormEnumComponent } from './theme-components';
import { ListComponent } from './theme-components';
import { GalleryComponent } from './theme-components';
import { CalendarComponent } from './theme-components';
import { ImageComponent } from './theme-components';
import { IconComponent } from './theme-components';
import { MediaComponent } from './theme-components';
import { VNavComponent } from './theme-components';
import { HNavComponent } from './theme-components';
import { TimelineComponent } from './theme-components';
import { DropdownComponent } from './theme-components';
import { VFiltersComponent } from './theme-components';
import { HFiltersComponent } from './theme-components';
import { ButtonComponent } from './theme-components';
import { ButtonGroupComponent } from './theme-components';

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
    FrmdbOnfocusDirective,
    DropHandleComponent,
    LayoutComponent,
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
    CardComponent,
    FormEnumComponent,
    ListComponent,
    GalleryComponent,
    CalendarComponent,
    ImageComponent,
    IconComponent,
    MediaComponent,
    VNavComponent,
    VNavSegmentComponent,
    HNavComponent,
    TimelineComponent,
    DropdownComponent,
    VFiltersComponent,
    HFiltersComponent,
    ButtonComponent,
    ButtonGroupComponent,
    CardContainerComponent
  ],
  providers: [
    FormEditingService,
    TableService,
    I18nPipe
  ]
})
export class LightThemeModule { }
