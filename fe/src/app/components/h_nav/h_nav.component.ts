import { OnInit, OnDestroy, ChangeDetectorRef, Component } from '@angular/core';

import { FormEditingService } from '../form-editing.service';
import { combineLatest, startWith } from 'rxjs/operators';
import { Home } from '@core/default_pages/website-metadata';
import { entites2navItems, NavigationItem } from '../v_nav/navigation.item';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[frmdb-h_nav]',
  templateUrl: './h_nav.component.html',
  styleUrls: ['./h_nav.component.scss']
})
export class HNavComponent implements OnInit, OnDestroy {
  public navigationItemsTree: NavigationItem[] = [];

  userIcon = faUserCircle;

  constructor(public formEditingService: FormEditingService,
    protected changeDetectorRef: ChangeDetectorRef) {
  }


  ngOnInit() {

    this.formEditingService.frmdbStreams.entities$.pipe(
      combineLatest(this.formEditingService.frmdbStreams.entity$.pipe(startWith(Home)))
    ).subscribe(([entities, selectedEntity]) => {
      this.navigationItemsTree = entites2navItems(entities, selectedEntity, true);
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
  }

}
