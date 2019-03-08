/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    OnInit, OnDestroy
} from '@angular/core';

import { BaseNodeComponent } from '../base_node';

import { FormAutocomplete } from "@core/domain/uimetadata/form";
import { FormEditingService } from '../form-editing.service';
import { UserEnteredAutocompleteText, UserChoseAutocompleteOption } from '@fe/app/actions/form.user.actions';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import * as _ from 'lodash';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { Observable, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { debounceTime, map, tap, combineLatest, zip, distinctUntilChanged } from 'rxjs/operators';
import { AutoCompleteState } from '@fe/app/state/app.state';
import { elvis, elvis_a } from '@core/elvis';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete;
    public text$: Subject<string> = new BehaviorSubject('');
    public formatedStrOptions: string[] = [];
    private control: AbstractControl | null;
    public autoCompleteState: AutoCompleteState | null;

    constructor(formEditingService: FormEditingService, private i18npipe: I18nPipe) {
        super(formEditingService);
    }

    getControl() {
        let ctrl = this.topLevelFormGroup.get(this.parentFormPath);
        if (!this.control) {
            if (ctrl) {
                let validators: ValidatorFn[] = [];
                if (ctrl.validator) validators.push(ctrl.validator);
                validators.push((control: AbstractControl): { [key: string]: any } | null => {
                    let validSelection = false;
                    for (let opt of elvis_a(elvis(this.autoCompleteState).options)) {
                        if (opt[this.inputElement.refPropertyName] === control.value) {
                            validSelection = true;
                        }
                    }
                    return validSelection ? null : { "option-not-found": "referenced value must exist" };
                });
                ctrl.setValidators(validators);
            }
            this.control = ctrl;
        }
        return this.control;
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormAutocomplete;
        this.getControl();
        if (this.control) {
            this.formatedStrOptions = [this.control.value];
        }

        this.subscriptions.push(this.frmdbStreams.autoCompleteState$.subscribe(async (autoCompleteState) => {
            if (!this.control) return;
            let parentObj = this.formEditingService.getParentObj(this.control);
            if (!parentObj || !parentObj._id || parentObj._id !== autoCompleteState.currentObjId) return;

            this.autoCompleteState = autoCompleteState;
            console.debug((this.control as any).name, autoCompleteState);

            if (autoCompleteState.selectedOption) {
                let ctrl = this.getControl();
                if (!ctrl) console.warn("Control not found for autocomplete ", this.topLevelFormGroup, this.parentFormPath);
                else {
                    ctrl.reset(autoCompleteState.selectedOption[this.inputElement.refPropertyName]);
                }
            }

            this.formatedStrOptions = [];
            for (let opt of autoCompleteState.options) {
                this.formatedStrOptions.push(this.getOptionValue(opt, autoCompleteState));
            }

            // return this.frmdbStreams.autoCompleteState$.pipe(
            //     map(autoCompleteState => {
            //         console.debug(autoCompleteState.options);
            //         return autoCompleteState.options;
            //     }));
    
        }));

        this.subscriptions.push(this.text$.pipe(
            distinctUntilChanged(),
            debounceTime(200),
        ).subscribe(val => {
                if (val.length >= 2 && this.control) {
                    let parentObj = this.formEditingService.getParentObj(this.control);
                    if (parentObj && parentObj._id) {
                        this.frmdbStreams.action(new UserEnteredAutocompleteText(parentObj._id, val, this.inputElement));
                    }
                }
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    getOptionValue(row, autoCompleteState: AutoCompleteState): string {
        let valueForCurrentControl = row[this.inputElement.refPropertyName];
        let relatedControlsValues: string[] = [];
        for (let relatedControl of Object.values(autoCompleteState.controls)) {
            if (relatedControl.propertyName === this.inputElement.propertyName) continue;
            relatedControlsValues.push(this.i18npipe.transform(relatedControl.propertyName) + ': '
                + row[relatedControl.propertyName]);
        }

        return valueForCurrentControl + " (" + relatedControlsValues.join(", ") + ")";
    }

    selectOption($event: NgbTypeaheadSelectItemEvent) {
        this.frmdbStreams.action(new UserChoseAutocompleteOption($event.item, this.inputElement));
    }
}
