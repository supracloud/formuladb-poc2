import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { getChildPath, NodeElement } from '@core/domain/uimetadata/form';

@Component({
  selector: 'frmdb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent extends BaseNodeComponent implements OnInit {
  theme: { [key: string]: string };

  constructor(formEditingService: FormEditingService, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  get style() {
    return this.sanitizer.bypassSecurityTrustStyle(
      Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
    );
  }
  ngOnInit() {
    console.log(this.nodeElement, this.topLevelFormGroup);
  }

  getChildPath(childEl: NodeElement) {
    return getChildPath(childEl);
  }
}
