/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { NavigationItem } from '../../../navigation.item';
import { Store } from '@ngrx/store';
import * as fromEntity from '../../../entity-state';
import { NavigationSegment as NavigationSegmentBase } from '../../default-theme/navigation/navigation.segment'

@Component({
    selector: 'frmdb-navigation-segment',
    styleUrls: ['navigation.segment.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './navigation.segment.html',
})
export class NavigationSegment extends NavigationSegmentBase implements OnInit {

    constructor(store: Store<fromEntity.EntityState>) {
        super(store);
    }

}