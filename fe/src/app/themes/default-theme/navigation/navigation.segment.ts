/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { NavigationItem } from '../../../navigation.item';
import { Store } from '@ngrx/store';
import * as fromEntity from '../../../entity-state';

@Component({
    selector: '[frmdb-navigation-segment]',
    styleUrls: ['navigation.segment.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './navigation.segment.html',
})
export class NavigationSegment implements OnInit {

    @Input("nav")
    nav: NavigationItem[];

    constructor(protected store: Store<fromEntity.EntityState>) { }

    ngOnInit(): void {

    }

    expand(id: string, event) {
        event.preventDefault();
        this.store.dispatch(new fromEntity.UserActionCollapsedEntity(id, false));
    }

    collapse(id: string, event) {
        event.preventDefault();
        this.store.dispatch(new fromEntity.UserActionCollapsedEntity(id, true));
    }

}