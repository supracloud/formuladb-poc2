import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';


import { Observable, Subscription } from 'rxjs';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { FormulaEditorService, UiToken } from '../formula-editor.service';
import { Router } from '@angular/router';
import { TokenType, Token, Suggestion } from 'src/app/common/formula_tokenizer';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {
  ftext: string;

  private currentSuggestions: Suggestion[];
  private activeSuggestion: number = 0;
  private noEditKeys: string[] = ['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'ArrowLeft', 'ArrowRight'];

  private currentTokens: UiToken[] = [];
  private currentTokenAtCaret: UiToken | undefined;

  @ViewChild('editor')
  private textarea: ElementRef;

  editorExpr: string;

  suggestion?: (string) => string[];

  validation?: (string) => { [key: string]: number[] };

  protected subscriptions: Subscription[] = [];

  constructor(private formulaEditorService: FormulaEditorService, private router: Router) {
    this.subscriptions.push(formulaEditorService.editorExpr$.subscribe(
      expr => this.editorExpr = expr || ''));
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
    let tokenAtCursor = this.currentTokens.find(x => x.pstart <= cursorPos && cursorPos <= x.pend)
    if (tokenAtCursor && tokenAtCursor.tableName) {
      let fragment = tokenAtCursor.tableName;
      this.router.navigate([this.router.url.replace(/(\/\d+).*/, (match, $1) => $1 + '/' + fragment)]);
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
    setTimeout(() => {
      this.ftext = "";
      if (this.editorExpr) {
        let errors;
        if (this.validation) {
          errors = this.validation(this.editorExpr);
        }
        let tokens: UiToken[] = this.formulaEditorService.tokenize(this.editorExpr, this.textarea.nativeElement.selectionStart);
        this.currentTokens = tokens;
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
          }
        }
        this.cursorMove(this.textarea.nativeElement.selectionStart);
      }
    }, 10);
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

    if (token.caret && token.value && token.value.length > 2) {
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
