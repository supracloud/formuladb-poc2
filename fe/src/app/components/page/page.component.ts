/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnChanges, DoCheck, OnDestroy } from '@angular/core';
import { untilDestroyed } from 'ngx-take-until-destroy';

import * as appState from '@fe/app/state/app.state';
import { Observable } from 'rxjs';
import { Page } from '@core/domain/uimetadata/page';
import { Theme } from '@core/domain/uimetadata/theme';
import { FormEditingService } from '../form-editing.service';

@Component({
  selector: 'frmdb-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, AfterViewInit, OnChanges, DoCheck, OnDestroy {

    selectedEntity$: Observable<appState.Entity | undefined>;
    colorPalette$: Observable<string>;
    sidebarImageUrl$: Observable<string>;
    page$: Observable<Page>;
    page: Page | null;

    constructor(public formEditingService: FormEditingService, private changeDetectorRef: ChangeDetectorRef) {
        this.selectedEntity$ = this.formEditingService.frmdbStreams.entity$;
        this.page$ = this.formEditingService.frmdbStreams.page$.pipe(untilDestroyed(this));
        this.page$.pipe(untilDestroyed(this)).subscribe(p => this.page = p);
    }

    protected getTheme(): Theme {
        return {
            themeCustomClasses: {}
        };
    }

    ngOnInit() {
        console.debug("ngOnInit", this.page);
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
        console.debug(this.page);
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
