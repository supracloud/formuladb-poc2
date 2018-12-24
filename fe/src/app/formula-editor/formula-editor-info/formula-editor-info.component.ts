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

  x: number = 50;
  y: number = 50;
  deltaX: number = 0;
  deltaY: number = 0;

  constructor(private formulaEditorService: FormulaEditorService) {
    this.editorOpened$ = formulaEditorService.editorExpr$.pipe(map(editorTxt => editorTxt != undefined));
  }

  ngOnInit() {
    window.addEventListener('dragover', e => e.preventDefault());
  }

  dragHandle(e: any) {
    console.log(e);
    this.x = e.clientX - this.deltaX;
    this.y = e.clientY - this.deltaY;
  }

  dragStartHandle(e: any) {
    this.deltaX = e.clientX - this.x;
    this.deltaY = e.clientY - this.y;
  }
}
