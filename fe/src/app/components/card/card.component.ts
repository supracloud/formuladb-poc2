import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { Card } from '@core/domain/uimetadata/form';

@Component({
  selector: 'frmdb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  host: {
    '[class.card]': 'true',
    '[class.mt-2]': 'true',
  }
})
export class CardComponent extends BaseNodeComponent implements OnInit {
  theme: { [key: string]: string };
  card: Card;


  constructor(formEditingService: FormEditingService, componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  get style() {
    return this.sanitizer.bypassSecurityTrustStyle(
      Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
    );
  }
  
  ngOnInit() {
    this.card = this.nodel as Card;
    console.log(this.nodel, this.formgrp);
  }
}
