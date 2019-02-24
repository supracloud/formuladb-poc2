/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DefaultThemeRoutingModule } from './default-theme-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NavigationSegment } from './navigation/navigation.segment';
import { ThemeEditorComponent } from './theme-editor/theme-editor.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { CrosscuttingModule } from '../../crosscutting/crosscutting.module';
import { DevModeCommonModule } from 'src/app/dev-mode-common/dev-mode-common.module';
import { FrmdbModule } from '@kv_selector_base/app/frmdb/frmdb.module';
import { FormTextComponent } from './components/form-text/form_text.component';
import { TableComponent } from './components/table/table.component';
import { FormComponent } from './components/form/form.component';
import { FormVerticalLayoutComponent } from './components/form-vertical-layout/form-vertical-layout.component';
import { FormItemComponent } from './components/form-item/form-item.component';
import { FormHorizontalLayoutComponent } from './components/form-horizontal-layout/form-horizontal-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { TableHeaderComponent } from '@kv_selector_base/app/table/table-header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { FormEditingService } from '@kv_selector_base/app/form/form-editing.service';
import { TableService } from '@kv_selector_base/app/table/table.service';
import { I18nPipe } from '@kv_selector_base/app/crosscutting/i18n/i18n.pipe';
import { FormTabsComponent } from '@kv_selector_base/app/form/form_tabs/form_tabs.component';

@NgModule({
  imports: [
    CommonModule,
    // FrmdbRoutingModule,
    FrmdbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AgGridModule.withComponents([TableComponent, TableHeaderComponent]),
    CrosscuttingModule,
    FontAwesomeModule,
    NgxChartsModule,
    NgxGraphModule,
    NgbModule,
    DefaultThemeRoutingModule,
    CrosscuttingModule,
    DevModeCommonModule
  ],
  declarations: [
    LayoutComponent,
    NavigationComponent,
    NavigationSegment,
    ThemeEditorComponent,
    TopNavComponent,
    TableComponent,
    FormComponent,
    FormItemComponent,
    FormTextComponent,
    FormVerticalLayoutComponent,
    FormHorizontalLayoutComponent,
    FormTabsComponent
  ],
  // providers: [FormEditingService,
  //   TableService,
  //   I18nPipe]
})
export class DefaultThemeModule { }
