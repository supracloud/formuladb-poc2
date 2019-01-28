/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BaseNodeComponent } from '../base_node';

import * as fromForm from '../form.state';
import { FormAutocomplete } from "@core/domain/uimetadata/form";
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FormEditingService } from '../form-editing.service';
import { switchMap, map, filter } from 'rxjs/operators';

@Component({
    selector: 'form-autocomplete',
    templateUrl: 'form_autocomplete.component.html',
    styleUrls: ['./../form_input/form_input.component.scss', 'form_autocomplete.component.scss']
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete;

    src = new BehaviorSubject('');

    value$: Observable<string>;

    optionsFn$: (search: string) => Observable<any[]>;

    options$: Observable<string[]>;

    selection$: Subject<any>;

    spotOptions: any[];

    constructor(protected fromStore: Store<fromForm.FormState>, protected formEditingService: FormEditingService) {
        super(fromStore);
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormAutocomplete;
        this.options$ = this.src.pipe(
            switchMap(v => this.formEditingService
                .getOptions(this.inputElement.refEntityName, this.inputElement.refPropertyName, v)
                .pipe(
                    map(optionList => {
                        this.spotOptions = optionList;
                        return optionList
                            .map(opt => opt[this.inputElement.refPropertyName]);
                    })
                )
            )
        );
        this.selection$ = this.formEditingService.getAutoComplete(this.inputElement.refEntityName);
        this.value$ = this.selection$.pipe(
            filter(s => s !== null && s !== undefined),
            map(s => s[this.inputElement.refPropertyName])
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    inputChange(val: string) {
        if (val.length > 2) {
            this.src.next(val);
        }
    }

    inputLeave(val: string) {
        const option = this.spotOptions.find(opt => opt[this.inputElement.refPropertyName] === val);
        if (option) { this.selection$.next(option); }
    }
}
