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
import { BaseNodeComponent } from '../base_node';

import * as fromForm from '../form.state';
import { FormAutocomplete } from 'src/app/common/domain/uimetadata/form';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { FormEditingService } from '../form-editing.service';
import { switchMap, map } from 'rxjs/operators';

@Component({
    selector: 'form-autocomplete',
    templateUrl: 'form_autocomplete.component.html',
    styleUrls: ['./../form_input/form_input.component.scss', 'form_autocomplete.component.scss']
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete;

    src = new BehaviorSubject('');

    optionsFn$: (search: string) => Observable<any[]>;

    @Input()
    entityName: string;

    @Input()
    fieldName: string;

    options$: Observable<string[]>;

    selection$: Subject<any>;

    spotOptions: any[];

    constructor(protected fromStore: Store<fromForm.FormState>, protected formEditingService: FormEditingService) {
        super(fromStore);
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormAutocomplete;
        this.options$ = this.src.pipe(
            switchMap(v => this.formEditingService.getOptions(this.entityName, this.fieldName, v)
                .pipe(
                    map(optionList => {
                        this.spotOptions = optionList;
                        return optionList
                            .map(opt => opt[this.fieldName]);
                    })
                )
            )
        );
        this.selection$=this.formEditingService.getAutoComplete(this.entityName);
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
        const option = this.spotOptions.find(opt => opt[this.fieldName] === val);
        if (option) this.selection$.next(option);
    }
}
