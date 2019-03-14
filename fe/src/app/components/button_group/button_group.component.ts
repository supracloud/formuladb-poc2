import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-button_group',
  templateUrl: './button_group.component.html',
  styleUrls: ['./button_group.component.scss']
})
export class ButtonGroupComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
