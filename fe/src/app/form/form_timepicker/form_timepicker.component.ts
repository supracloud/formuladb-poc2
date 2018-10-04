/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from "../base_node";

import * as fromForm from '../form.state';

@Component({
  selector: '[form_timepicker]',
  templateUrl: 'form_timepicker.component.html',
  styleUrls: ['./../form_input/form_input.component.scss']
})
export class FormTimepickerComponent extends BaseNodeComponent {
  constructor(protected store: Store<fromForm.FormState>) {
    super(store);
}
}
