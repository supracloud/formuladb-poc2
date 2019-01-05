import { Directive } from '@angular/core';
import { NgControl } from '@angular/forms';

import * as appState from '../app.state';
import { Store } from '@ngrx/store';
import { FrmdbFormControl } from './form.component';


@Directive({
  selector: '[frmdbOnfocus]',
  host: {
    '(focus)': 'onFocus($event)',
  }  
})
export class FrmdbOnfocusDirective {

  constructor(public formControl: NgControl, private store: Store<appState.AppState>) {
  }
  onFocus($event) {
    if (this.formControl.control && this.formControl.control instanceof FrmdbFormControl) {
      this.store.dispatch(new appState.UserSelectCell(this.formControl.control.name));
    }
  }
}
