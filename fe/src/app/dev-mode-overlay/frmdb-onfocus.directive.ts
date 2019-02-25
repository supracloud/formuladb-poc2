import { Directive, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

import * as appState from '../app.state';
import { Store } from '@ngrx/store';
import { FrmdbFormControl } from '../form/form.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Directive({
  selector: '[frmdbOnfocus]',
  host: {
    '(focus)': 'onFocus($event)',
  }
})
export class FrmdbOnfocusDirective implements OnInit, OnDestroy {
  focusEvents$: Subject<number> = new Subject();
  protected subscriptions: Subscription[] = [];

  constructor(public formControl: NgControl, private store: Store<appState.AppState>) {
  }

  onFocus($event) {
    this.focusEvents$.next(1);
  }

  ngOnInit(): void {
    this.subscriptions.push(this.focusEvents$.pipe(debounceTime(500)).subscribe(() => {
      if (this.formControl.control && this.formControl.control instanceof FrmdbFormControl) {
        this.store.dispatch(new appState.UserSelectCell(this.formControl.control.name));
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
