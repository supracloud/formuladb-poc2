import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import * as fromEntity from '../../../entity-state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

@Component({
  selector: 'frmdb-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  selectedEntity$: Observable<fromEntity.Entity>;

  constructor(protected store: Store<fromEntity.EntityState>, private router: Router) {
    this.selectedEntity$ = this.store.select(fromEntity.getSelectedEntityState)    
  }

  ngOnInit() {
  }

  protected switchTheme(themeIdx: number) {
    this.router.navigate([this.router.url.replace(/\/\d+\//, '/' + themeIdx + '/')]);
  }  

}
