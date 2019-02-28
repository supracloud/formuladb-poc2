/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators'

import { NavigationItem } from './navigation.item';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

export class VNavComponent implements OnInit {
  metadataCatalog$: Observable<NavigationItem[]>;

  constructor(public frmdbStreams: FrmdbStreamsService) {
    this.metadataCatalog$ = frmdbStreams.entities$.pipe(
      withLatestFrom(frmdbStreams.entity$),
      map(([entities, selectedEntity]) => entities.map(entity => {
        return {
          id: entity._id,
          linkName: entity._id,
          path: entity._id,
          active: entity._id === selectedEntity._id,
          children: [],//FIXME: topological sort by CHILD_TABLES
          collapsed: entity._id !== selectedEntity._id,
        }
      }))
    );
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
