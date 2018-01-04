import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseNodeComponent } from "./../base_node";

@Component({
  selector: '[form-datepicker]',
  host: { class: "col form-group" },
  templateUrl:'form-datepicker.component.html',
  styleUrls:['./../form-input/form-input.component.scss']
})
export class FormDatepickerComponent extends BaseNodeComponent {
}
