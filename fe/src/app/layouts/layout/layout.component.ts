/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck } from '@angular/core';
import { Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';

import * as appState from '../../state/app.state';
import { Observable } from 'rxjs';
import { Page } from '@core/domain/uimetadata/page';
import { merge, map, filter, tap } from 'rxjs/operators';
import { isNotNullOrUndefined } from '@core/elvis';

export class LayoutComponent implements OnInit, AfterViewInit, OnChanges, DoCheck {
  selectedEntity$: Observable<appState.Entity | undefined>;
  themeColorPalette$: Observable<string>;
  sidebarImageUrl$: Observable<string>;
  page$: Observable<Page>;
  layout: Page['layout'] | null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, protected store: Store<appState.EntityState>, 
  private changeDetectorRef: ChangeDetectorRef) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.themeColorPalette$ = this.store.select(appState.getThemeColorPalette);
    this.sidebarImageUrl$ = this.store.select(appState.getSidebarImageUrl);
    this.page$ = this.store.select(appState.getFormState).pipe(
      merge(this.store.select(appState.getTableState)),
      merge(this.store.select(appState.getTableState)),
      filter(isNotNullOrUndefined),
      map(x => x.page),
      filter(isNotNullOrUndefined),
      tap(x => {
        console.log(x);
        this.layout = x.layout;
      })
    );
  }

  ngOnInit() {
    this.page$.subscribe(x => {
      try {
        this.changeDetectorRef.detectChanges();
      } catch (err) {
        console.debug(err);
      }
    });
  }

  
  ngAfterViewInit(): void {
  }

  ngDoCheck(): void {
    console.debug("ngDoCheck");
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    console.debug("ngOnChanges", changes);
  }

}
