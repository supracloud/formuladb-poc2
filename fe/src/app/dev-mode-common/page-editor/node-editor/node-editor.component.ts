import { Component, OnInit, Input } from '@angular/core';
import { NodeElement } from '@core/domain/uimetadata/node-elements';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';

@Component({
  selector: 'frmdb-node-editor',
  templateUrl: './node-editor.component.html',
  styleUrls: ['./node-editor.component.scss']
})
export class NodeEditorComponent implements OnInit {

  @Input()
  nodel: NodeElement;

  constructor() { }

  ngOnInit() {
  }

}
