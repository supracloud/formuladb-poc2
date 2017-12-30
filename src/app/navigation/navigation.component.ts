import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import * as fromEntity from '../entity-state';

@Component({
  selector: 'mwz-navigation',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-group">
      <a *ngFor="let entity of metadataCatalog" class="list-group-item list-group-item-action" [routerLink]="[entity.path]" routerLinkActive="active">{{entity.indent}}{{entity.linkName}}</a>
    </div>  
  `
})
export class NavigationComponent implements OnInit {
  metadataCatalog: { linkName: string, path: string, indent: string }[] = [];
  entities$: Observable<fromEntity.Entity[]>;

  constructor(private store: Store<fromEntity.EntityState>, private cdr: ChangeDetectorRef) {
    this.entities$ = this.store.select(fromEntity.getEntitiesState);
  }

  ngOnInit() {
    this.entities$.subscribe(x => {
      this.metadataCatalog = x.sort((e1, e2) => e1._id < e2._id ? -1 : (e1._id > e2._id ? 1 : 0))
        .map(entity => ({
          linkName: entity._id.split(/__/).slice(-1)[0],
          path: entity._id,
          indent: '- '.repeat(entity._id.split(/__/).length - 1)
        }))
      this.cdr.detectChanges();
    });
  }
}
