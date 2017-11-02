import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import * as fromEntity from '../entity-state';

@Component({
  selector: 'mwz-navigation',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="list-group">
      <li *ngFor="let entity of metadataCatalog" class="list-group-item">
          <a [routerLink]="[entity.path]">{{entity.indent}}{{entity.linkName}}</a>
      </li>
    </ul>  
  `
})
export class NavigationComponent implements OnInit {
  metadataCatalog: { linkName: string, path: string, indent: string }[] = [];
  entities$: Observable<fromEntity.Entity[]>;

  constructor(private store: Store<fromEntity.EntityState>) {
    this.entities$ = this.store.select(fromEntity.getEntitiesState);
  }

  ngOnInit() {
    this.entities$.subscribe(x => {
      this.metadataCatalog = x.map(entity => ({
        linkName: entity._id.split(/__/).slice(-1)[0],
        path: entity._id,
        indent: '- '.repeat(entity._id.split(/__/).length - 1)
      }))
    });
  }
}
