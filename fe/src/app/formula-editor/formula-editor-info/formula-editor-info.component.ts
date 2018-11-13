import { Component, OnInit } from '@angular/core';
import { FormulaEditorService } from '../formula-editor.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'frmdb-formula-editor-info',
  templateUrl: './formula-editor-info.component.html',
  styleUrls: ['./formula-editor-info.component.scss']
})
export class FormulaEditorInfoComponent implements OnInit {

  public editorOpened$: Observable<boolean>;

  constructor(private formulaEditorService: FormulaEditorService) {
    this.editorOpened$ = formulaEditorService.editorExpr$.pipe(map(editorTxt => editorTxt != undefined));
  }

  ngOnInit() {
  }

}
