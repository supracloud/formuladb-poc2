/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnInit, Input, Component } from '@angular/core';
import { NavigationItem } from './navigation.item';
import { Observable } from 'rxjs';

import { FormEditingService } from '../form-editing.service';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';


@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-v_nav_segment]',
    templateUrl: './v_nav_segment.component.html',
    styleUrls: ['./v_nav_segment.component.scss']
})
export class VNavSegmentComponent implements OnInit {

    @Input("nav")
    nav: NavigationItem[];

    public devMode$: Observable<boolean>;
    public frmdbStreams: FrmdbStreamsService;

    constructor(protected formEditingService: FormEditingService) {
        this.devMode$ = formEditingService.frmdbStreams.devMode$;
        this.frmdbStreams = formEditingService.frmdbStreams;
    }

    ngOnInit(): void {

    }

    expand(id: string, event) {
        event.preventDefault();
        this.frmdbStreams.userEvents$.next({type: "UserCollapsedNavItem", id, collapsed: false});
    }

    collapse(id: string, event) {
        event.preventDefault();
        this.frmdbStreams.userEvents$.next({type: "UserCollapsedNavItem", id, collapsed: true});
    }

}