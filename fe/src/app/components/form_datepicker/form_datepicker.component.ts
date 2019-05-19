/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, OnDestroy, Component } from '@angular/core';
import { BaseNodeComponent } from "../base_node";
import { FormDatepicker } from "@domain/uimetadata/node-elements";
import { FormEditingService } from '../form-editing.service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-form_datepicker',
  templateUrl: './form_datepicker.component.html',
  styleUrls: ['../form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends BaseNodeComponent implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  inputElement: FormDatepicker;

  ngOnInit(): void {
    this.inputElement = this.nodel as FormDatepicker;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
