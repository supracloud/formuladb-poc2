import { Component, OnInit } from '@angular/core';


import { Observable, Subscription } from 'rxjs';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { FormulaEditorService } from '../formula-editor.service';
import { Router } from '@angular/router';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {
  protected subscriptions: Subscription[] = [];

  editorExpr: string | undefined;

  constructor(private formulaEditorService: FormulaEditorService, private router: Router) {
    this.subscriptions.push(formulaEditorService.editorExpr$.subscribe(
      expr => this.editorExpr = expr));
  }

  ngOnInit() {
  }

  handleChange($event) {
    console.warn('ngModelChange', $event);
  }

  private keywords: string[] = ["rammstein", "rammbird", "rammspider", "metawiz"];

  setClass(word: string): string {
    return this.keywords.some((s) => s === word) ? "keyword" : '';
  }

  doValidation(text: string): { [key: string]: number[] } {
    return { "BlaBla": [0, 25] };
  }

  setSuggestion(stem: string): string[] {
    if (this.keywords && stem.length > 3) {
      return this.keywords.filter((s) => s.startsWith(stem));
    } else return [];
  }

  cursorMove(cursorPos: number) {
    //TODO: navigate to entity on cursor and highlight columns
    this.router.navigate([this.router.url.replace(/(\/\d+).*/, (match, $1) => $1 + '/Inventory___Receipt___Item')]);
  }
}
