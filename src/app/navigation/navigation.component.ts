import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import * as state from './state';

import { MockService } from "../test/mock.service";

@Component({
  selector: 'mwz-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  entities$: Observable<state.Entity[]>;

  constructor(private store: Store<state.State>, private mockService: MockService) {
    this.entities$ = this.store.select(state.getNavEntitiesState);
  }

  ngOnInit() {
    this.entities$.subscribe(x => 
      this.metadataCatalog = x.map(entity => ({
        linkName: entity.path.split(/__/).slice(-1)[0],
        path: entity.path,
        indent: '- '.repeat(entity.path.split(/__/).length - 1)
      })));
      
    this.mockService.loadInitialEntities();
  }
}
