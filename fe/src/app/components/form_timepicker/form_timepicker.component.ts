/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, forwardRef, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from "../base_node";

import { FormTimepicker } from "@core/domain/uimetadata/form";
import { FormEditingService } from '../form-editing.service';

export class FormTimepickerComponent extends BaseNodeComponent implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  inputElement: FormTimepicker ;

  ngOnInit():void{
    this.inputElement = this.nodeElement as FormTimepicker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
