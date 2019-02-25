/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from "../base_node";

import * as fromForm from '../form.state';
import { FormTimepicker } from "@core/domain/uimetadata/form";

export class FormTimepickerComponent extends BaseNodeComponent implements OnInit, OnDestroy {
  constructor(protected formStore: Store<fromForm.FormState>) {
    super(formStore);
  }

  inputElement: FormTimepicker ;

  ngOnInit():void{
    this.inputElement = this.nodeElement as FormTimepicker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
