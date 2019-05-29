import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  selector: 'frmdb-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent extends BaseNodeComponent implements OnInit {

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
  }

}
