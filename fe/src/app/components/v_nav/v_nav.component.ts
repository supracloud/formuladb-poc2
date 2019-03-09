/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, ChangeDetectorRef } from '@angular/core';

import { Observable } from 'rxjs';
import { map, startWith, combineLatest, tap } from 'rxjs/operators'

import { NavigationItem } from './navigation.item';

import { FormEditingService } from '../form-editing.service';
import * as _ from 'lodash';
import { Pn, Entity } from '@core/domain/metadata/entity';
import { Home } from '@core/default_pages/website-metadata';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';

export class VNavComponent implements OnInit {
  public navigationItemsTree: NavigationItem[] = [];
  public frmdbStreams: FrmdbStreamsService;

  constructor(public formEditingService: FormEditingService,
    protected changeDetectorRef: ChangeDetectorRef) {
      this.frmdbStreams = formEditingService.frmdbStreams;
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

    this.frmdbStreams.entities$.pipe(
      combineLatest(this.frmdbStreams.entity$.pipe(startWith(Home)))
    ).subscribe(([entities, selectedEntity]) => {
      let navItemsTree: Map<string, NavigationItem> = new Map(entities.map(e =>
        [e._id, this.entity2NavSegment(e, selectedEntity)] as [string, NavigationItem]));
      for (let entity of entities) {
        if (entity.pureNavGroupingChildren && entity.pureNavGroupingChildren.length > 0) {
          for (let childEntityId of entity.pureNavGroupingChildren) {
            if (navItemsTree.get(childEntityId)) {
              navItemsTree.get(childEntityId)!.isNotRootNavItem = true;
              navItemsTree.get(entity._id)!.children.push(navItemsTree.get(childEntityId)!);
            }
          }
        }
        for (let prop of Object.values(entity.props)) {
          if (prop.propType_ === Pn.CHILD_TABLE && prop.referencedEntityName && navItemsTree.get(prop.referencedEntityName)) {
            navItemsTree.get(prop.referencedEntityName!)!.isNotRootNavItem = true;
            navItemsTree.get(entity._id)!.children.push(navItemsTree.get(prop.referencedEntityName!)!);
          }
        }
      }

      this.navigationItemsTree = Array.from(navItemsTree.values()).filter(item => !item.isNotRootNavItem);
      this.changeDetectorRef.detectChanges();
    });
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
