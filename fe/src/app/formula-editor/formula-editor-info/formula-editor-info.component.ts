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
    this.editorOpened$ = formulaEditorService.editorExpr$.pipe(map(editorTxt => editorTxt !== undefined));
  }
  x = 20;
  y = 20;
  deltaX = 0;
  deltaY = 0;
  dragged = false;

  ngOnInit() {
    document.body.addEventListener('dragover', e => {
      e.preventDefault();
      return false;
    });
  }

  dragStartHandle(e: any) {
    this.deltaX = e.clientX - this.x;
    this.deltaY = e.clientY - this.y;
    this.dragged = true;
  }

  dragHandle(e: any) {
    if (this.dragged) {
      this.x = e.clientX - this.deltaX;
      this.y = e.clientY - this.deltaY;
    }
  }

  dragEndHandle(e: any) {
    this.dragged = false;

  }

}
