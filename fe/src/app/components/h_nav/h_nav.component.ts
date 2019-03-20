import { OnInit, OnDestroy, ChangeDetectorRef, Component, DoCheck } from '@angular/core';

import { FormEditingService } from '../form-editing.service';
import { combineLatest, startWith, tap } from 'rxjs/operators';
import { Home } from '@core/default_pages/website-metadata';
import { entites2navItems, NavigationItem } from '../v_nav/navigation.item';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'nav[frmdb-h_nav]',
    templateUrl: './h_nav.component.html',
    styleUrls: ['./h_nav.component.scss'],
})
export class HNavComponent implements OnInit, OnDestroy, DoCheck {
    public navigationItemsTree: NavigationItem[] = [];

    userIcon = faUserCircle;

    constructor(public formEditingService: FormEditingService,
        protected changeDetectorRef: ChangeDetectorRef) {
        console.warn("constructor");
    }


    ngOnInit() {
        console.debug("ngOnInit");
        this.formEditingService.frmdbStreams.entities$.pipe(
            tap(x => console.debug(x)),
            combineLatest(this.formEditingService.frmdbStreams.entity$.pipe(startWith(Home))),
            tap(x => console.debug(x)),
        ).subscribe(([entities, selectedEntity]) => {
            this.navigationItemsTree = entites2navItems(entities, selectedEntity, true);
            if (!this.changeDetectorRef['destroyed']) {
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    ngDoCheck(): void {
        console.debug("ngDoCheck");
    }

    ngOnDestroy() {
    }

}
