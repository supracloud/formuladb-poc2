/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

import * as fromEntity from '../../../entity-state';
import { NavigationItem, unflatten } from '../../../navigation.item';
import { NavigationComponent as NavigationComponentBase} from '../../default-theme/navigation/navigation.component'
import { AppState } from 'src/app/app.state';

@Component({
  selector: '[frmdb-navigation]',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation.component.html',
})
export class NavigationComponent extends NavigationComponentBase {
  metadataCatalog$: Observable<NavigationItem[]>;

  constructor(store: Store<AppState>) {
    super(store);
  }

}