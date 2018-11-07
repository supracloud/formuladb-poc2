import { Component, OnInit } from '@angular/core';

import {
  Editor,
  EditorChangeLinkedList,
  EditorFromTextArea,
  ScrollInfo,
} from 'codemirror';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
