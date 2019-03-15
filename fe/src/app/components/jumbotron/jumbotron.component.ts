import { Component, OnInit, HostBinding } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';

@Component({
  selector: '[frmdb-jumbotron]',
  templateUrl: './jumbotron.component.html',
  styleUrls: ['./jumbotron.component.scss'],
  host: {
    '[class.jumbotron]': 'true',
  }

})
export class JumbotronComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
