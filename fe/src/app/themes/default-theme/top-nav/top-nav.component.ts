import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import * as appState from '../../../app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from '../../../theme.state';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  selectedEntity$: Observable<appState.Entity>;
  developerMode$: Observable<boolean>;

  constructor(protected store: Store<appState.AppState>, private router: Router) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.developerMode$ = this.store.select(appState.isEditMode);
  }

  ngOnInit() {
  }

  protected switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\/?/, '/' + themeIdx + '/')]);
  }

  protected switchThemeColorPalette(color: string) {
    this.store.dispatch(new ThemeColorPaletteChangedAction(color));
  }

  protected switchSideBarImage(url: string) {
    this.store.dispatch(new ThemeSidebarImageUrlChangedAction(url));
  }


  toggleDeveloperMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }

}
