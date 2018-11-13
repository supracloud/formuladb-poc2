import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription[] = [];

  developerMode: boolean = false;
  editorOpened: boolean = false;

  constructor(protected store: Store<appState.AppState>, private router: Router) {
    this.subscriptions.push(this.store.select(appState.getDeveloperMode).subscribe(prop => this.developerMode = prop));
  }

  ngOnInit() {
  }

  protected switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\/?/, '/' + themeIdx + '/')]);
  }

  protected switchThemeColorPalette(color: string) {
    this.store.dispatch(new ThemeColorPaletteChangedAction(color));
  }

  protected switchLanguage(language: string) {
    
  }

  protected switchSideBarImage(url: string) {
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

  ngOnDestroy() {
    // this.formModalService.sendDestroyFormEvent();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
