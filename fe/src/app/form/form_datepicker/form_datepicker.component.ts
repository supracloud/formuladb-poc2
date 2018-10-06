/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BaseNodeComponent } from "../base_node";
import * as fromForm from '../form.state';

@Component({
  selector: 'form-datepicker',
  host: { class: "col form_group" },
  templateUrl: 'form_datepicker.component.html',
  styleUrls: ['./../form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends BaseNodeComponent {
  constructor(protected formStore: Store<fromForm.FormState>) {
    super(formStore);
  }
}
