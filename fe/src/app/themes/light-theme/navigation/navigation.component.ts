/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map, withLatestFrom, filter } from 'rxjs/operators'

import * as fromEntity from '../../../entity-state';
import { NavigationItem } from '../../../navigation.item';
import { AppState, parseUrl } from 'src/app/app.state';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

@Component({
  selector: 'frmdb-navigation',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation.component.html',
})
export class NavigationComponent implements OnInit {
  metadataCatalog$: Observable<NavigationItem[]>;

  constructor(protected store: Store<AppState>) {
    this.metadataCatalog$ = this.store.select(fromEntity.getEntitiesTree)
      .pipe(
        withLatestFrom(this.store.select(state => state.router ? state.router.state.url : null)),
        // filter(([entities, route]) => route != null),
        map(([entities, route]) => {
          const rp = parseUrl(route!);
          const path = rp === null || rp.path === null ? [] : rp.path.split("__");
          const re = this.setCollapsed(entities, path);
          return re;
        }
      ));
  }

  ngOnInit() {

  }

  private setCollapsed(entities: any[], route: string[]): any[] {
    return entities.map(e => {
      if (route.indexOf(e.linkName) < 0 && e.children.length > 0) e.onPath = false;
      if (route.indexOf(e.linkName) >= 0 && e.children.length > 0) e.onPath = true;
      e.children = this.setCollapsed(e.children, route);
      return e;
    });
  }
}