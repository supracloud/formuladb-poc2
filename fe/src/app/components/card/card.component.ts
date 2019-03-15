import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';

@Component({
  selector: 'frmdb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  host: {
    '[class.card]': 'true',
  }
})
export class CardComponent extends BaseNodeComponent implements OnInit {
  theme: { [key: string]: string };

  constructor(formEditingService: FormEditingService, componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  get style() {
    return this.sanitizer.bypassSecurityTrustStyle(
      Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
    );
  }
  
  ngOnInit() {
    console.log(this.nodel, this.formgrp);
  }
}
