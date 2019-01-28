import { Component, OnInit, Input } from '@angular/core';
import { Pn } from '@core/domain/metadata/entity';
import { FormInput, NodeElement } from '@core/domain/uimetadata/form';

@Component({
  selector: 'frmdb-form-input-editor',
  templateUrl: './form-input-editor.component.html',
  styleUrls: ['./form-input-editor.component.scss']
})
export class FormInputEditorComponent implements OnInit {

  constructor() { }

  @Input()
  item: NodeElement;

  @Input()
  properties: string[];

  propertyName: string;

  propertyType: string;

  propertyTypes = [Pn.STRING, Pn.NUMBER, Pn.TEXT];

  ngOnInit() {
    if (this.item) {
      this.propertyType = this.item['propertyType'];
      this.propertyName = this.item['propertyName'];
    }
  }

}
