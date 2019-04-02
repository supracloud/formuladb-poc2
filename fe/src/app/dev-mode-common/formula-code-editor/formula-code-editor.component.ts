import { Component, OnInit, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';


import { Observable, Subscription, Subject } from 'rxjs';

import { FormulaEditorService, UiToken } from '../../effects/formula-editor.service';
import { Router } from '@angular/router';
import { TokenType, Token, Suggestion } from "@core/formula_tokenizer";
import { faCheckCircle, faTimesCircle, faSortNumericDown, faTextHeight, faCalendarAlt, faHourglass, faHourglassHalf, faTable, faHandPointRight, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { Pn, EntityProperty } from '@core/domain/metadata/entity';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {
  ftext: string;

  private onEdit$: Subject<any> = new Subject();
  private currentSuggestions: Suggestion[];
  private activeSuggestion: number = 0;
  private noEditKeys: string[] = ['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'ArrowLeft', 'ArrowRight'];

  private currentTokens: UiToken[] = [];
  private currentTokenAtCaret: UiToken | undefined;

  @ViewChild('editor')
  private textarea: ElementRef;

  editorExpr: string;
  editorOn: boolean = false;
  editorExprHasErrors: boolean = false;

  suggestion?: (string) => string[];

  validation?: (string) => { [key: string]: number[] };

  protected subscriptions: Subscription[] = [];

  constructor(public formulaEditorService: FormulaEditorService, private router: Router, protected changeDetectorRef: ChangeDetectorRef) {
    this.subscriptions.push(formulaEditorService.editorOn$.subscribe(x => {
      if (this.editorOn && !x) {
        this.ftext = '';
      } else if (!this.editorOn && x) {
        this.onEdit();
      }
      this.editorOn = x;
    }));
    this.subscriptions.push(formulaEditorService.editorExpr$.subscribe(expr => {
      if (!this.editorOn) return;
      this.editorExpr = expr || '';
    }));
    this.subscriptions.push(this.onEdit$.pipe(debounceTime(250)).subscribe(() => this.performOnEdit()));
  }

  ngOnInit() {
    this.subscriptions.push(this.formulaEditorService.selectedFormula$.subscribe(selectedFormula => {
      if (this.editorOn) return;
      this.editorExpr = selectedFormula || 'COLUMN';
      this.changeDetectorRef.detectChanges();
      console.debug(this.editorExpr);
    }));
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
    let tokenAtCursor = this.currentTokens.find(x => x.pstart <= cursorPos && cursorPos <= x.pend)
    if (tokenAtCursor && tokenAtCursor.tableName && tokenAtCursor.errors.length === 0) {
      let fragment = tokenAtCursor.tableName;
      this.router.navigate([this.router.url.replace(/^(\/\w+).*/, (match, $1) => $1 + '/' + fragment)]);
    }
  }


  onAutoComplete(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.currentTokenAtCaret && this.currentSuggestions && this.currentSuggestions.length > 0 && this.activeSuggestion >= 0 && this.activeSuggestion < this.currentSuggestions.length) {
      this.currentTokenAtCaret.value = this.currentSuggestions[this.activeSuggestion].suggestion;
      this.editorExpr = this.currentTokens.map(t => t.value).join('');
      this.currentSuggestions = [];
      this.activeSuggestion = 0;
      this.currentTokenAtCaret = undefined;
      this.onEdit();
    }
  }

  keyup(textarea, event) {
    if (!this.noEditKeys.find(k => k == event.key)) {
      this.onEdit();
    }
    else if (textarea.selectionStart != null) {
      this.cursorMove(textarea.selectionStart);
    }
  }
  click(textarea, event) {
    if (this.currentTokens.length == 0) {
      this.onEdit();
    } else if (textarea.selectionStart != null) {
      this.cursorMove(textarea.selectionStart);
    }
  }
  onEdit(): void {
    this.onEdit$.next();
  }
  performOnEdit(): void {
    this.ftext = "";
    if (this.editorExpr) {
      let errors;
      if (this.validation) {
        errors = this.validation(this.editorExpr);
      }
      let tokens: UiToken[] = this.formulaEditorService.tokenize(this.editorExpr, this.textarea.nativeElement.selectionStart);
      console.log(tokens);
      this.currentTokens = tokens;
      let editedPropertyToSend = this.getEntityPropertyFromTokens(tokens);
      let hasErrors: boolean = false;
      for (let i: number = 0; i < tokens.length; i++) {
        switch (tokens[i].type) {
          case TokenType.NLINE:
            this.ftext += "<br>";
            break;
          case TokenType.SPACE:
            this.ftext += "&nbsp;";
            break;
          default:
            this.ftext += this.renderToken(tokens[i]);
            hasErrors = hasErrors || (tokens[i].errors && tokens[i].errors.length > 0);
        }
      }
      this.cursorMove(this.textarea.nativeElement.selectionStart);
      if (!hasErrors) {
        this.editorExprHasErrors = false;
        this.formulaEditorService.previewFormula(this.editorExpr);
        this.formulaEditorService.editorExprHasErrors$.next(false);
        if (editedPropertyToSend) {
          this.formulaEditorService.editedProperty$.next(editedPropertyToSend);
        }
      } else {
        this.formulaEditorService.editorExprHasErrors$.next(true);
        this.editorExprHasErrors = true;
      }
    }
  }

  getEntityPropertyFromTokens(tokens: UiToken[]): EntityProperty | null {
    for (let token of tokens) {
      if (token.errors && token.errors.length > 0) {
        return null;
      }
    }

    if (tokens.length <= 0) return null;

    if (this.editorExpr.indexOf(Pn.REFERENCE_TO) === 0) {
      let entityNameToken = tokens[2];
      let propertyNameToken = tokens[4];
      if (!entityNameToken) {
        tokens[0].errors.push("missing referenced table name");
        return null;
      }
      if (entityNameToken.type !== TokenType.TABLE_NAME) {
        tokens[0].errors.push("Expected table name but found " + entityNameToken.value + " at " + entityNameToken.pstart);
        return null;
      }
      if (!propertyNameToken) {
        tokens[0].errors.push("missing referenced column name of referenced table " + entityNameToken.value);
        return null;
      }
      if (propertyNameToken.type !== TokenType.COLUMN_NAME) {
        tokens[0].errors.push("Expected column name but found " + propertyNameToken.value + " at " + propertyNameToken.pstart);
        return null;
      }

      return {
        name: ((this.formulaEditorService.formulaState || {} as any).editedProperty || {} as any).name,
        propType_: Pn.REFERENCE_TO,
        referencedEntityName: entityNameToken.value,
        referencedPropertyName: propertyNameToken.value,
      };
    } else {
      return {
        name: ((this.formulaEditorService.formulaState || {} as any).editedProperty || {} as any).name,
        propType_: Pn.FORMULA,
        formula: this.editorExpr,
      };
    }
  }

  nextSuggestion(event: any): void {
    if (this.currentSuggestions && this.currentSuggestions.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.activeSuggestion < this.currentSuggestions.length - 1) {
      this.activeSuggestion++;
      this.onEdit();
    }
  }

  prevSuggestion(event: any): void {
    if (this.currentSuggestions && this.currentSuggestions.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.activeSuggestion > 0) {
      this.activeSuggestion--;
      this.onEdit();
    }
  }

  private setSelectionRange(input: any, selectionStart: number, selectionEnd: number): void {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
      let range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  }

  private setCaretToPos(input: any, pos: number): void {
    this.setSelectionRange(input, pos, pos);
  }

  private buildSuggestionBox(): string {
    let re: string = "<div class='suggestion'>";
    this.currentSuggestions.forEach((s, i) => {
      re += "<div class='suggestion-element" + (i === this.activeSuggestion ? " suggestion-active" : "") + "'>";
      re += s.suggestion;
      re += "</div>";
    });
    re += "</div>";
    return re;
  }

  private buildErrorBox(errors: string[]): string {
    return "<div class='error-note-holder'><div class='error-note'>" + errors.slice(0, 1).join("</div><div class='error-note'>") + "</div></div>";
  }

  private renderToken(token: UiToken): string {
    let ret: string[] = [];
    let cls = token.class;

    this.formulaEditorService.checkTokenForErrors(token);
    let hasErrors = token.errors && token.errors.length > 0;

    ret.push("<span class='" + cls + " " + (hasErrors ? 'editor-error' : '') + "'>" + token.value + "</span>");

    if (token.caret) {
      this.currentSuggestions = this.formulaEditorService.getSuggestionsForToken(token);
      this.currentTokenAtCaret = token;
      if (this.currentSuggestions && this.currentSuggestions.length > 0) {
        ret.push(this.buildSuggestionBox());
      }
    }

    if (hasErrors && token.caret) {
      ret.push(this.buildErrorBox(token.errors));
    }

    return ret.join('');
  }

}
