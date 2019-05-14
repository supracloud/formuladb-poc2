import { Component, OnInit, ComponentFactoryResolver, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { FormEditingService } from '../form-editing.service';
import { BaseNodeComponent } from '../base_node';
import { Card, NodeElement, CssForNodeElement } from '@core/domain/uimetadata/node-elements';

@Component({
  selector: 'frmdb-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent extends BaseNodeComponent implements OnInit {
  theme: { [key: string]: string };
  card: Card;
  get tmp() {
    console.log("badasdfasdfasdf");
    return true;
  }

  constructor(formEditingService: FormEditingService, componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer) {
    super(formEditingService);
  }

  get style() {
    return this.sanitizer.bypassSecurityTrustStyle(
      Object.keys(this.theme).map(k => k + ':' + this.theme[k]).join(';')
    );
  }

  getCssClasses(nodeEl: CssForNodeElement): string[] {
    return super.getCssClasses(nodeEl).concat('card mt-2 vh-60');
  }
  
  ngOnInit() {
    this.card = this.nodel as Card;
    console.log(this.nodel, this.formgrp);
  }
}
