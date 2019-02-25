import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from 'src/app/theme.state';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit, OnDestroy {

  protected subscriptions: Subscription[] = [];

  developerMode: boolean = false;

  constructor(protected store: Store<appState.AppState>) {
    this.subscriptions.push(this.store.select(appState.getDeveloperMode).subscribe(prop => this.developerMode = prop));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // this.formModalService.sendDestroyFormEvent();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
