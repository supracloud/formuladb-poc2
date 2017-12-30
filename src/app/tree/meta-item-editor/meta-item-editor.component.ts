import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NodeElement } from '../../domain/uimetadata/form';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TreeObject } from '../tree.object';
import * as _ from 'lodash';

@Component({
  selector: 'meta-item-editor',
  templateUrl: './meta-item-editor.component.html',
  styleUrls: ['./meta-item-editor.component.scss']
})
export class MetaItemEditorComponent implements OnInit {

  @Input()
  element: TreeObject<any>;

  @Output()
  finished: EventEmitter<any> = new EventEmitter();

  private metaItemForm: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    const fg = {};
    this.element.descriptor.forEach(d => {
      fg[d.property] = new FormControl(this.element[d.property] || '');
    });
    this.metaItemForm = new FormGroup(fg);
  }

  save() {
    this.finished.emit(this.element.patch(this.metaItemForm.value));
  }

  cancel() {
    this.finished.emit(null);
  }
}
