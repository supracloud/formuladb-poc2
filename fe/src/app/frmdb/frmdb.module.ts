/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AgGridModule } from "ag-grid-angular";

import { FrmdbRoutingModule } from './frmdb-routing.module';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TableComponent } from '../table/table.component';
import { FormComponent } from '../form/form.component';
import { FormInputComponent } from '../form/form_input/form_input.component';
import { FormAutocompleteComponent } from '../form/form_autocomplete/form_autocomplete.component';
import { FormTabsComponent } from '../form/form_tabs/form_tabs.component';
import { FormItemComponent } from '../form/form_item/form_item.component';
import { FormTimepickerComponent } from '../form/form_timepicker/form_timepicker.component';
import { FormDatepickerComponent } from '../form/form_datepicker/form_datepicker.component';
import { FormTableComponent } from '../form/form_table/form_table.component';
import { FormEditingService } from '../form/form-editing.service';
import { EditPanelComponent } from '../form/edit-panel/edit-panel.component';
import { CrosscuttingModule } from '../crosscutting/crosscutting.module';
import { I18nPipe } from '../crosscutting/i18n/i18n.pipe';

@NgModule({
  imports: [
    CommonModule,
    FrmdbRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AgGridModule.withComponents([TableComponent]),
    CrosscuttingModule,
  ],
  declarations: [
    NotFoundComponent,
    TableComponent,
    FormComponent,
    FormInputComponent,
    FormAutocompleteComponent,
    FormTabsComponent,
    FormTableComponent,
    FormDatepickerComponent,
    FormTimepickerComponent,
    FormItemComponent,
    EditPanelComponent,
  ],
  providers: [
    FormEditingService
  ]
})
export class FrmdbModule { }
