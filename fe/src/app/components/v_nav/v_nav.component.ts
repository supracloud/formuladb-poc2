/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, ChangeDetectorRef } from '@angular/core';

import { Observable } from 'rxjs';
import { map, startWith, combineLatest, tap } from 'rxjs/operators'

import { NavigationItem } from './navigation.item';

import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';
import * as _ from 'lodash';
import { Pn, Entity } from '@core/domain/metadata/entity';
import { Home } from '@core/default_pages/website-metadata';

export class VNavComponent implements OnInit {
  public navigationItemsTree: NavigationItem[] = [];

  constructor(public frmdbStreams: FrmdbStreamsService,
    protected changeDetectorRef: ChangeDetectorRef) {

    frmdbStreams.entities$.pipe(
      combineLatest(frmdbStreams.entity$.pipe(startWith(Home), tap(x => console.warn(x))))
    ).subscribe(([entities, selectedEntity]) => {
      let navItemsTree: Map<string, NavigationItem> = new Map(entities.map(e =>
        [e._id, this.entity2NavSegment(e, selectedEntity)] as [string, NavigationItem]));
      for (let entity of entities) {
        for (let prop of Object.values(entity.props)) {
          if (prop.propType_ === Pn.CHILD_TABLE && prop.referencedEntityName && navItemsTree.get(prop.referencedEntityName)) {
            console.warn(entity, prop.referencedEntityName);
            navItemsTree.get(prop.referencedEntityName!)!.isNotRootNavItem = true;
            navItemsTree.get(entity._id)!.children.push(navItemsTree.get(prop.referencedEntityName!)!);
          }
        }
      }

      this.navigationItemsTree = Array.from(navItemsTree.values()).filter(item => !item.isNotRootNavItem);
      this.changeDetectorRef.detectChanges();
    });
  }

  private entity2NavSegment(entity: Entity, selectedEntity: Entity): NavigationItem {
    return {
      id: entity._id,
      linkName: entity._id,
      path: entity._id,
      active: selectedEntity._id === entity._id,
      children: [],
      collapsed: selectedEntity._id !== entity._id,
    };
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
