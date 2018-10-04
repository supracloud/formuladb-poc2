/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

import * as fromEntity from '../../../entity-state';
import { NavigationItem } from '../../../navigation.item';

@Component({
  selector: '[frmdb-navigation]',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation.component.html',
})
export class NavigationComponent implements OnInit {
  metadataCatalog$: Observable<NavigationItem[]>;

  constructor(protected store: Store<fromEntity.EntityState>) {
    this.metadataCatalog$ = this.store.select(fromEntity.getEntitiesTree)
  }

  ngOnInit() {

  }
}