/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, ChangeDetectorRef, Component } from '@angular/core';

import { Observable } from 'rxjs';
import { map, startWith, combineLatest, tap } from 'rxjs/operators'

import { NavigationItem, entites2navItems } from './navigation.item';

import { FormEditingService } from '../form-editing.service';
import * as _ from 'lodash';
import { Pn, Entity } from '@domain/metadata/entity';
import { Home } from '@core/default_pages/website-metadata';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nav[frmdb-v_nav]',
  templateUrl: './v_nav.component.html',
  styleUrls: ['./v_nav.component.scss']
})
export class VNavComponent implements OnInit {
  public navigationItemsTree: NavigationItem[] = [];
  public frmdbStreams: FrmdbStreamsService;

  constructor(public formEditingService: FormEditingService,
    protected changeDetectorRef: ChangeDetectorRef) {
      this.frmdbStreams = formEditingService.frmdbStreams;
  }

  ngOnInit() {

    this.frmdbStreams.entities$.pipe(
      combineLatest(this.frmdbStreams.entity$.pipe(startWith(Home)))
    ).subscribe(([entities, selectedEntity]) => {
      this.navigationItemsTree = entites2navItems(entities, selectedEntity);
      if (!this.changeDetectorRef['destroyed']) {
        this.changeDetectorRef.detectChanges();
      }
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
