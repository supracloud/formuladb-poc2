/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck, OnDestroy } from '@angular/core';

import * as appState from '@fe/app/state/app.state';
import { Observable } from 'rxjs';
import { Page } from '@core/domain/uimetadata/page';
import { Theme } from '@core/domain/uimetadata/theme';
import { merge, map, filter, tap } from 'rxjs/operators';
import { isNotNullOrUndefined } from '@core/elvis';
import { FormEditingService } from '../form-editing.service';

@Component({
  selector: 'frmdb-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy {

    selectedEntity$: Observable<appState.Entity | undefined>;
    themeColorPalette$: Observable<string>;
    sidebarImageUrl$: Observable<string>;
    page$: Observable<Page>;
    layout: Page['layout'] | null;

    constructor(public formEditingService: FormEditingService, private changeDetectorRef: ChangeDetectorRef) {
        this.selectedEntity$ = this.formEditingService.frmdbStreams.entity$;
        this.themeColorPalette$ = this.formEditingService.frmdbStreams.themeColorPalette$;
        this.sidebarImageUrl$ = this.formEditingService.frmdbStreams.sidebarImageUrl$;
        this.page$ = this.formEditingService.frmdbStreams.form$.pipe(
            tap(x => console.debug(x)),
            merge(this.formEditingService.frmdbStreams.table$),
            tap(x => console.debug(x)),
            filter(isNotNullOrUndefined),
            tap(x => console.debug(x)),
            map(x => x.page),
            tap(x => console.debug(x)),
            filter(isNotNullOrUndefined),
            tap(x => console.debug(x)),
            tap(x => this.layout = x.layout)
        );
    }

    protected getTheme(): Theme {
        return {
            themeCustomClasses: {}
        };
    }

    ngOnInit() {
        console.debug("ngOnInit", this.layout);
        //TODO: cleanup, perhaps use this: https://github.com/NetanelBasal/ngx-take-until-destroy
        this.page$.subscribe(x => {
            try {
                if (!this.changeDetectorRef['destroyed']) {
                    if (!this.changeDetectorRef['destroyed']) {
                        this.changeDetectorRef.detectChanges();
                    }
                }
            } catch (err) {
                console.debug(err);
            }
        });
    }


    ngAfterViewInit(): void {
        console.debug(this.layout);
    }

    ngDoCheck(): void {
        console.debug("ngDoCheck");
    }
    ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
        console.debug("ngOnChanges", changes);
    }
    ngOnDestroy(): void {
        console.debug("ngOnDestroy");
    }
}
