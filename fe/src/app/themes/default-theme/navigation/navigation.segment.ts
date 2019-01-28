/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { NavigationItem } from '../../../navigation.item';
import { Store } from '@ngrx/store';
import * as appState from '../../../app.state';
import { Observable } from 'rxjs';

@Component({
    selector: '[frmdb-navigation-segment]',
    styleUrls: ['navigation.segment.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './navigation.segment.html',
})
export class NavigationSegment implements OnInit {

    @Input("nav")
    nav: NavigationItem[];

    public devMode$: Observable<boolean>;

    constructor(protected store: Store<appState.EntityState>) {
        this.devMode$ = store.select(appState.getDeveloperMode);
    }

    ngOnInit(): void {

    }

    expand(id: string, event) {
        event.preventDefault();
        this.store.dispatch(new appState.CollapsedEntityAction(id, false));
    }

    collapse(id: string, event) {
        event.preventDefault();
        this.store.dispatch(new appState.CollapsedEntityAction(id, true));
    }

}