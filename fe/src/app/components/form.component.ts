/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive, OnDestroy, OnChanges, ChangeDetectorRef, HostBinding
} from '@angular/core';

import { Location } from '@angular/common';

import { FormControl, FormGroup, FormArray } from '@angular/forms';

import { DataObj } from "@core/domain/metadata/data_obj";
import { Form, NodeElement, NodeType, getChildPath } from "@core/domain/uimetadata/form";
import { Subscription } from 'rxjs';
import { filter, debounceTime, tap, combineLatest } from 'rxjs/operators';
import * as _ from 'lodash';

import { ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormEditingService } from './form-editing.service';
import { AbstractControlOptions } from '@angular/forms';
import { AsyncValidatorFn } from '@angular/forms';
import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import { CircularJSON } from '@core/json-stringify';

export class FrmdbFormControl extends FormControl {
    constructor(public name: string,
        formState?: any,
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
        super(formState, validatorOrOpts);
    }
}
export class FrmdbFormGroup extends FormGroup {
    constructor(public name: string) {
        super({});
    }

    setControl(name: string, control: AbstractControl): void {
        super.setControl(name, control);
    }

}

@Component({
    selector: 'frmdb-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    host: {
        "novalidate": "",
    }
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit, OnDestroy, OnChanges {
    // @HostBinding("formGroup")
    public theFormGroup: FormGroup;
    public changes: any[] = [];

    public formData: DataObj | null;
    public form: Form | null;
    public rdonly: boolean;
    protected subscriptions: Subscription[] = [];

    constructor(
        public frmdbStreams: FrmdbStreamsService,
        public formEditingService: FormEditingService,
        protected changeDetectorRef: ChangeDetectorRef,
        public _location: Location
    ) {
        this.formEditingService.formChangeDetectorRef = changeDetectorRef;
        try {
            this.theFormGroup = new FrmdbFormGroup('TOP_LEVEL');
        } catch (ex) {
            console.error(ex);
        }
    }

    protected getChildPath(childEl: NodeElement) {
        return getChildPath(childEl);
    }
        
    ngOnInit() {
        const cmp = this;

        this.subscriptions.push(
            this.frmdbStreams.form$.pipe(
                combineLatest(this.frmdbStreams.formData$, this.frmdbStreams.readonlyMode$))
                .subscribe(([form, formData, rdonly]) => {
                    try {
                        this.rdonly = rdonly || form.isEditable !== true;
                        this.syncReadonly(rdonly, this.theFormGroup);

                        this.formEditingService.updateFormGroup(this.theFormGroup, this.theFormGroup, form.childNodes || [], this.rdonly);
                        this.updateFormGroupWithData(formData, this.theFormGroup, this.rdonly);
                        this.formData = formData;
                        this.form = form;
                    } catch (ex) {
                        console.error(ex);
                    }
                    console.debug(form, this.form, this.formData);
                    if (!this.changeDetectorRef['destroyed']) {
                        console.debug(form, this.form, this.formData);
                        this.changeDetectorRef.detectChanges();
                    }
                }));
    }
    ngOnChanges() {
        console.debug(this.form, this.formData);
    }

    private syncReadonly(rdonly: boolean, control: AbstractControl) {
        if (rdonly && !control.disabled) {
            control.disable();
        } else if (!rdonly && control.disabled) {
            control.enable();
        }
    }

    private formulaFieldValidation(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const forbidden = nameRe.test(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    private updateFormGroupWithData(objFromServer: DataObj, formGroup: FormGroup, rdonly: boolean) {

        // TODO: CONCURRENT-EDITING-CONFLICT-HANDLING (see edit_flow.puml)
        this.syncReadonly(rdonly, formGroup);

        for (const key in objFromServer) {
            if ('type_' === key) { continue; }
            // if ('_rev' === key) continue;
            // if ('_id' === key) continue;

            const objVal = objFromServer[key];
            let formVal = formGroup.get(key);
            if (null === objVal) { continue; }

            if (objVal instanceof Array) {
                if (null == formVal) {
                    formVal = new FormArray([]);
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormArray)) {
                    throw new Error('key ' + key + ', objVal Array \'' + objVal + '\', but formVal not FormArray: \'' + formVal + '\'');
                }

                let formArray = formVal as FormArray;
                for (let [i, o] of objVal.entries()) {
                    if (formArray.length <= i) {
                        formArray.push(new FormGroup({}));
                    }
                    this.updateFormGroupWithData(o, formArray.at(i) as FormGroup, rdonly);
                };
                for (let i = objVal.length; i < formArray.length; i++) {
                    formArray.removeAt(i);
                }

            } else if (/string|boolean|number/.test(typeof objVal) || objVal instanceof Date) {
                if (null == formVal) {
                    formVal = this.formEditingService.makeFormControl(this.theFormGroup, key, { value: undefined, disabled: rdonly });
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormControl)) {
                    throw new Error('key ' + key + ', objVal scalar \'' + objVal + '\', but formVal not FormControl: \'' + CircularJSON.stringify(formVal) + '\'');
                }

                formVal.reset(objVal);
                this.syncReadonly(rdonly, formVal);
            } else if ('object' === typeof objVal) {
                if (null == formVal) {
                    formVal = new FormGroup({});
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormGroup)) {
                    throw new Error('key ' + key + ', objVal object \'' + objVal + '\', but formVal not FormGroup: \'' + formVal + '\'');
                }

                this.updateFormGroupWithData(objVal, formVal, rdonly);
            } else {
                throw new Error('unkown objVal type: \'' + objVal + '\'');
            }

        }
    }

    // ngAfterViewInit() {
    //     setTimeout(x => {
    //         // this.formModalService.sendGridsterFormFinishedRenderingEvent();
    //     });
    // }

    close() {
        // this.formModalService.sendDestroyFormEvent();
    }

    ngOnDestroy() {
        // this.formModalService.sendDestroyFormEvent();
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    print(): void {
        console.error('TODO implement Print!');
    }

    /**
     * TODO: make this a proper deep compare function
     * @param a
     * @param b
     */
    private areEqual(a, form: FormGroup): boolean {
        for (const key in a) {
            if ('_rev' === key) { continue; }

            const formVal = (form.get(key) || { value: null }).value;
            if (a[key] !== formVal) {
                console.log('DIFFERENCE FOUND ON KEY ', key, a[key], formVal);
                return false;
            }
        }
        return true;
    }

    private goBack() {
        this._location.back();
    }

}
