import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'frmdb-h_filters',
  templateUrl: './h_filters.component.html',
  styleUrls: ['./h_filters.component.scss']
})
export class HFiltersComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
