import { Component, OnInit } from '@angular/core';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';
import { Subscription } from 'rxjs';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: '[frmdb-dev-mode-opts]',
  templateUrl: './dev-mode-opts.component.html',
  styleUrls: ['./dev-mode-opts.component.scss']
})
export class DevModeOptsComponent implements OnInit {
  tableIcon = faTable;
  columnIcon = faColumns;
  addIcon = faPlusCircle;
  delIcon = faMinusCircle;
    
  editorOpened: boolean = false;
  developerMode: boolean = false;
  protected subscriptions: Subscription[] = [];

  constructor(protected store: Store<appState.AppState>, private router: Router) {
    this.subscriptions.push(this.store.select(appState.getDeveloperMode).subscribe(prop => {
      this.developerMode = prop
    }));
  }

  ngOnInit() {
  }


  switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\/?/, '/' + themeIdx + '/')]);
  }

  switchThemeColorPalette(color: string) {
    this.store.dispatch(new ThemeColorPaletteChangedAction(color));
  }

  switchLanguage(language: string) {
    
  }

  switchSideBarImage(url: string) {
    this.store.dispatch(new ThemeSidebarImageUrlChangedAction(url));
  }

  formulaFocused() {
    this.editorOpened = true;
  }

  toggleFormulaEditor() {
    if (!this.developerMode) return;

    this.editorOpened = !this.editorOpened;
  }
  
  toggleDeveloperMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }

}
