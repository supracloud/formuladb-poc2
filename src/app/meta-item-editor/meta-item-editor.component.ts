import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NodeElement } from '../domain/uimetadata/form';

@Component({
  selector: 'meta-item-editor',
  templateUrl: './meta-item-editor.component.html',
  styleUrls: ['./meta-item-editor.component.scss']
})
export class MetaItemEditorComponent implements OnInit {

  @Input()
  element: NodeElement;

  @Output()
  finished: EventEmitter<boolean> = new EventEmitter(false);

  constructor() { }

  ngOnInit() {
  }

  save() {
    this.finished.emit(true);
  }

  cancel(){
    this.finished.emit(false);
  }
}
