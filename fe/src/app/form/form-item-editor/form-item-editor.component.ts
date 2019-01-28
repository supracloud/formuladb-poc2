import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeElement, NodeType } from 'src/app/comm@core/domain/uimetadata/form';

@Component({
  selector: 'frmdb-form-item-editor',
  templateUrl: './form-item-editor.component.html',
  styleUrls: ['./form-item-editor.component.scss']
})
export class FormItemEditorComponent implements OnInit {

  constructor() { }

  closed = true;

  type: NodeType;

  @Input()
  item: NodeElement;

  @Input()
  types: NodeType[];

  @Input()
  properties: string[];

  @Output()
  save: EventEmitter<NodeElement> = new EventEmitter();

  ngOnInit() {
    this.type = this.item.nodeType;
  }

  public open() {
    this.closed = false;
  }

  close() {
    this.closed = true;
  }

  ignoreClick(event: any) {
    event.stopPropagation();
  }

  onSave() {
    this.save.emit(this.item);
    this.close();
  }

}
