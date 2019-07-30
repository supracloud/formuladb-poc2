import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-form_enum',
  templateUrl: './form_enum.component.html',
  styleUrls: ['./form_enum.component.scss']
})
export class FormEnumComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
