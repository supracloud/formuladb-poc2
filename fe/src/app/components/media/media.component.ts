import { Component, OnInit } from '@angular/core';
import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { Media, CssForNodeElement } from '@core/domain/uimetadata/node-elements';

@Component({
  selector: '[frmdb-media]',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent extends BaseNodeComponent implements OnInit {
  media: Media;
  
  getCssClasses(nodeEl: CssForNodeElement): string[] {
    return super.getCssClasses(nodeEl).concat('media');
  }

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }

  ngOnInit() {
    this.media = this.nodel as Media;
    console.log(this.nodel, this.formgrp);
  }
}
