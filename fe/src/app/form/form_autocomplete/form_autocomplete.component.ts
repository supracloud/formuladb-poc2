/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from "../base_node";

import * as fromForm from '../form.state';
import { FormAutocomplete } from 'src/app/common/domain/uimetadata/form';

@Component({
    selector: 'form-autocomplete',
    host: { class: 'col', style: "padding-left: 25px" },
    templateUrl: 'form_autocomplete.component.html',
    styleUrls: ['./../form_input/form_input.component.scss', 'form_autocomplete.component.scss']
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete = this.nodeElement as FormAutocomplete;

    constructor(protected fromStore: Store<fromForm.FormState>) {
        super(fromStore);
    }

    ngOnInit(): void {
        console.log(this.nodeElement, this.topLevelFormGroup);
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }
}