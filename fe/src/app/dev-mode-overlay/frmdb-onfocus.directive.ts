import { Directive, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

import { FrmdbFormControl } from '../form/form.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';


@Directive({
  selector: '[frmdb-on_focus]',
  host: {
    '(focus)': 'onFocus($event)',
  }
})
export class FrmdbOnfocusDirective implements OnInit, OnDestroy {
  focusEvents$: Subject<number> = new Subject();
  protected subscriptions: Subscription[] = [];

  constructor(public formControl: NgControl, private frmdbStreams: FrmdbStreamsService) {
    console.warn("FrmdbOnfocusDirective");
  }

  onFocus($event) {
    this.focusEvents$.next(1);
  }

  ngOnInit(): void {
    this.subscriptions.push(this.focusEvents$.pipe(debounceTime(500)).subscribe(() => {
      if (this.formControl.control && this.formControl.control instanceof FrmdbFormControl) {
        this.frmdbStreams.userEvents$.next({type: "UserSelectedCell", columnName: this.formControl.control.name});
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
}
