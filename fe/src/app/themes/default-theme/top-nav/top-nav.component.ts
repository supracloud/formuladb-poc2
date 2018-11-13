import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import * as appState from '../../../app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from '../../../theme.state';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription[] = [];

  selectedEntity$: Observable<appState.Entity | null>;
  selectedProperty: EntityProperty | null;
  developerMode$: Observable<boolean>;

  constructor(protected store: Store<appState.AppState>, private router: Router) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.subscriptions.push(this.store.select(appState.getSelectedPropertyState).subscribe(prop => this.selectedProperty = prop));
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

  protected switchLanguage(language: string) {
    
  }

  protected switchSideBarImage(url: string) {
    this.store.dispatch(new ThemeSidebarImageUrlChangedAction(url));
  }

  public getFormula() {
    if (this.selectedProperty) {
      if (this.selectedProperty.propType_ == Pn.FORMULA) {
        return this.selectedProperty.formula;
      } else return this.selectedProperty.propType_;
    } else return null;
  }

  toggleDeveloperMode() {
    this.store.dispatch(new appState.CoreToggleDeveloperModeAction());
  }

  ngOnDestroy() {
    // this.formModalService.sendDestroyFormEvent();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
