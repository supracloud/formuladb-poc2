import { Component, OnInit } from '@angular/core';
import { BaseNodeComponent } from "./base_node";

@Component({
  selector: '[form-table]',
  template: `
    <p>
      form-table Works!
    </p>
  `,
  styles: []
})
export class FormTableComponent extends BaseNodeComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
