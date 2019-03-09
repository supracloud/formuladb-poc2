/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, OnDestroy } from '@angular/core';
import { BaseNodeComponent } from "../base_node";
import { FormDatepicker } from "@core/domain/uimetadata/form";
import { FormEditingService } from '../form-editing.service';


export class FormDatepickerComponent extends BaseNodeComponent implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  inputElement: FormDatepicker;

  ngOnInit(): void {
    this.inputElement = this.nodeElement as FormDatepicker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
