import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';


import { Observable, Subscription } from 'rxjs';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { FormulaEditorService, UiToken } from '../formula-editor.service';
import { Router } from '@angular/router';
import { TokenType, Token } from 'src/app/common/formula_tokenizer';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {
  ftext: string;

  private suggestions: string[];
  private activeSuggestion: number = 0;

  private currentTokens: UiToken[] = [];

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
    let tokenAtCursor = this.currentTokens.find(x => x.getStartPos() <= cursorPos && cursorPos <= x.getEndPos())
    if (tokenAtCursor && tokenAtCursor.getTableName()) {
      let fragment = tokenAtCursor.getTableName();
      this.router.navigate([this.router.url.replace(/(\/\d+).*/, (match, $1) => $1 + '/' + fragment)]);
    }
  }


  onAutoComplete(event: any): void {
    if (this.suggestions && this.suggestions.length > 0) {
      event.stopPropagation();
      event.preventDefault();
      let caret = event.currentTarget.selectionStart;
      let word = this.editorExpr.substring(this.editorExpr.substring(0, caret).search(/[^\r\n\s\t]+$/), caret).trim();
      let diff = this.suggestions[this.activeSuggestion].substring(word.length);
      let observer: MutationObserver = new MutationObserver(() => {
        this.setCaretToPos(this.textarea.nativeElement, caret + diff.length + 1);
        observer.disconnect();
      });
      observer.observe(this.textarea.nativeElement, { attributes: true, childList: true });
      this.editorExpr = this.editorExpr.substring(0, caret)
        + diff + " "
        + this.editorExpr.substring(caret);
      this.suggestions = [];
      this.activeSuggestion = 0;
      this.onEdit(caret);
    }
  }

  keyup(textarea, event) {
    if (event.key != 'ArrowLeft' && event.key != 'ArrowRight') {
      this.onEdit(event);
    } else if (textarea.selectionStart != null) {
      this.cursorMove(textarea.selectionStart);
    }
  }
  click(textarea, event) {
    if (this.currentTokens.length == 0) {
      this.onEdit(event);
    } else if (textarea.selectionStart != null) {
      this.cursorMove(textarea.selectionStart);
    }
  }
  onEdit(event: any, nochange?: boolean): void {
    let noAction: string[] = ['Tab', 'ArrowDown', 'ArrowUp', 'Enter'];
    if (!noAction.some(a => a === event.code)) {
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
            switch (tokens[i].getType()) {
              case TokenType.NLINE:
                this.ftext += "<br>";
                break;
              case TokenType.SPACE:
                this.ftext += "&nbsp;";
                break;
              default:
                if (tokens[i].isCaret() && tokens[i].getValue() && tokens[i].getValue().length > 2) {
                  if (!nochange) {
                    this.suggestions = this.getSuggestions(tokens[i].getValue());
                    this.activeSuggestion = 0;
                  }
                  // this.suggestions = ['suggestion1', 'sugestion2'];
                  // tokens[i].errors = ['err1', 'err2'];
                  if (this.suggestions && this.suggestions.length > 0) {
                    this.ftext += tokens[i].getValue() + this.buildSuggestionBox() + this.buildErrorBox(tokens[i].getErrors());
                    continue;
                  }
                }
                this.ftext += this.renderToken(tokens[i]);
            }
          }
          this.cursorMove(this.textarea.nativeElement.selectionStart);
        }
      }, 10);
    }
  }

  nextSuggestion(event: any): void {
    if (this.suggestions && this.suggestions.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.activeSuggestion < this.suggestions.length - 1) {
      this.activeSuggestion++;
      this.onEdit(event.currentTarget.selectionStart, true);
    }
  }

  prevSuggestion(event: any): void {
    if (this.suggestions && this.suggestions.length > 0) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.activeSuggestion > 0) {
      this.activeSuggestion--;
      this.onEdit(event.currentTarget.selectionStart, true);
    }
  }

  private getSuggestions(stem: string): string[] {
    if (this.suggestion) {
      return this.suggestion(stem);
    }
    else return [];
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
    this.suggestions.forEach((s, i) => {
      re += "<div class='suggestion-element" + (i === this.activeSuggestion ? " suggestion-active" : "") + "'>";
      re += s;
      re += "</div>";
    });
    re += "</div>";
    return re;
  }

  private buildErrorBox(errors: string[]): string {
    return "<div class='error-note-holder'><div class='error-note'>" + errors.join("</div><div class='error-note'>") + "</div></div>";
  }

  private renderToken(token: UiToken): string {
    let cls = token.getClass();

    if (token.getErrors() && token.getErrors().length > 0) {

      return "<span class='" + (cls ? cls + " " : "") + "editor-error'>" + token.getValue() + "</span>" + (token.isCaret() ? this.buildErrorBox(token.getErrors()) : "");
    }
    return "<span class='" + cls + "'>" + token.getValue() + "</span>";
  }

}
