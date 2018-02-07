import { Component, OnInit, forwardRef } from '@angular/core';

import { BaseNodeComponent } from "./../base_node";

@Component({
  selector: '[form-datepicker]',
  host: { class: "col form_group" },
  templateUrl:'form_datepicker.component.html',
  styleUrls:['./../form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends BaseNodeComponent {
}
