import { OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

export class IconComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
