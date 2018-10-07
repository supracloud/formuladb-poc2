/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from "../base_node";

import * as fromForm from '../form.state';

@Component({
  selector: 'form-timepicker',
  templateUrl: 'form_timepicker.component.html',
  styleUrls: ['./../form_input/form_input.component.scss']
})
export class FormTimepickerComponent extends BaseNodeComponent implements OnDestroy {
  constructor(protected formStore: Store<fromForm.FormState>) {
    super(formStore);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
