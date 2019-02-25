/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BaseNodeComponent } from "../base_node";
import * as fromForm from '../form.state';
import { FormDatepicker } from "@core/domain/uimetadata/form";


export class FormDatepickerComponent extends BaseNodeComponent implements OnInit, OnDestroy {
  constructor(protected formStore: Store<fromForm.FormState>) {
    super(formStore);
  }

  inputElement: FormDatepicker;

  ngOnInit(): void {
    this.inputElement = this.nodeElement as FormDatepicker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
