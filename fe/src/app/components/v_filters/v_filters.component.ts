import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-v_filters',
  templateUrl: './v_filters.component.html',
  styleUrls: ['./v_filters.component.scss']
})
export class VFiltersComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
