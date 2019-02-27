/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive, OnDestroy
} from '@angular/core';

import { Location } from '@angular/common';

import { FormControl, FormGroup, FormArray } from '@angular/forms';

import { DataObj } from "@core/domain/metadata/data_obj";
import { Form, NodeElement, NodeType } from "@core/domain/uimetadata/form";
import { Subscription } from 'rxjs';
import { filter, debounceTime, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import * as fromForm from './form.state';
import { ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormEditingService } from './form-editing.service';
import { AbstractControlOptions } from '@angular/forms';
import { AsyncValidatorFn } from '@angular/forms';
import { j2str } from '../crosscutting/utils/j2str';
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';
import { UserModifiedFormData } from '../frmdb-streams/frmdb-user-events';

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

export class FormComponent implements OnInit, OnDestroy {
    public theFormGroup: FormGroup;
    public changes: any[] = [];

    private tickUsed: boolean = false;
    private lastSaveEvent: UserModifiedFormData;
    public formData: DataObj | null;
    public form: DataObj | null;
    private formReadOnly: boolean;
    private saveInProgress = false;
    private alertType = 'success';
    protected subscriptions: Subscription[] = [];

    constructor(
        public frmdbStreams: FrmdbStreamsService,
        public formEditingService: FormEditingService,
        public _location: Location
    ) {
        try {
            this.theFormGroup = new FrmdbFormGroup('TOP_LEVEL');
        } catch (ex) {
            console.error(ex);
        }
    }

    ngOnInit() {
        const cmp = this;

        this.subscriptions.push(this.frmdbStreams.readonlyMode$.subscribe(formReadOnly => {
            this.formReadOnly = formReadOnly;
            if (formReadOnly && !this.theFormGroup.disabled) {
                this.theFormGroup.disable();
            } else if (!formReadOnly && this.theFormGroup.disabled) {
                this.theFormGroup.enable();
            }
        }));

        this.subscriptions.push(this.frmdbStreams.form$.subscribe(form => {
            try {
                if (null === form) { return; }
                // set readonly fields
                this.updateFormGroup(this.theFormGroup, form.grid.childNodes || [], this.formReadOnly);
                this.form = form;
            } catch (ex) {
                console.error(ex);
            }
            console.warn(form, this.form, this.formData);
        }));

        this.subscriptions.push(this.frmdbStreams.formData$.subscribe(formData => {
            try {
                this.formData = formData;
                if (formData == null) { return; }

                this.updateFormGroupWithData(formData, this.theFormGroup, this.formReadOnly);
            } catch (ex) {
                console.error(ex);
            }
            console.warn(formData, this.form, this.formData);
        }));
    }

    private formulaFieldValidation(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const forbidden = nameRe.test(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    private makeFormControl(name: string, formState?: any): FormControl {
        const ctrl = new FrmdbFormControl(name, formState, {
            updateOn: 'blur',
            validators: [
                this.formEditingService.propertyValidator()
            ],
            asyncValidators: [
                // this.formEditingService.asycValidator()
                // this.testAsyncValidator.validate.bind(this.testAsyncValidator),
            ]
        });

        ctrl.valueChanges.pipe(
            filter(() => !ctrl.disabled && ctrl.dirty && ctrl.valid),
            debounceTime(500)
        )
            .forEach(valueChange => {
                console.log('CHANGEEEEES:', j2str(valueChange),
                    this.theFormGroup.errors, this.theFormGroup.dirty, this.theFormGroup.status);
                const obj = this.formEditingService.getParentObj(ctrl);
                if (obj == null) {
                    console.warn('Cound not find parent for ' + valueChange);
                    return;
                }
                this.lastSaveEvent = {type: "UserModifiedFormData", obj: _.cloneDeep(obj)};
                this.frmdbStreams.userEvents$.next(this.lastSaveEvent);
            });

        return ctrl;
    }

    private updateFormGroup(parentFormGroup: FormGroup, nodeElements: NodeElement[], formReadOnly: boolean) {
        let newParent = parentFormGroup;
        let disabled = formReadOnly;
        for (const nodeEl of nodeElements) {

            if (nodeEl.nodeType === NodeType.form_grid
                || nodeEl.nodeType === NodeType.h_layout
                || nodeEl.nodeType === NodeType.v_layout
                || nodeEl.nodeType === NodeType.form_tab) {
                const childNodes = nodeEl.childNodes || [];
                this.updateFormGroup(newParent, childNodes, formReadOnly);
            } else if (nodeEl.nodeType === NodeType.form_input
                || nodeEl.nodeType === NodeType.form_autocomplete
                || nodeEl.nodeType === NodeType.form_datepicker
                || nodeEl.nodeType === NodeType.form_timepicker) {
                if (nodeEl.propertyName === 'type_') { return; }
                if (nodeEl.propertyName === '_id' || nodeEl.propertyName === '_rev') { disabled = true; }
                if (parentFormGroup.get(nodeEl.propertyName) == null) {
                    parentFormGroup.setControl(nodeEl.propertyName,
                        this.makeFormControl(nodeEl.propertyName, { value: undefined, disabled }));
                }
                // } else if (nodeEl.nodeType === NodeType.form_autocomplete) {
                // let autocompleteNode = parentFormGroup.get(nodeEl.refEntityName);
                // let madeChanges = false;
                // if (autocompleteNode == null) {
                //     madeChanges = true;
                //     autocompleteNode = new FrmdbFormGroup(nodeEl.refEntityName);
                // }
                // if (autocompleteNode instanceof FormGroup) {
                //     for (let copiedProp of nodeEl.snapshotCurrentValueOfProperties || []) {
                //         if (null == autocompleteNode.get(copiedProp)) {
                //             autocompleteNode.setControl(copiedProp, this.makeFormControl(copiedProp, { value: undefined, disabled }));
                //             madeChanges = true;
                //         }
                //     }
                //     if (madeChanges) {
                //         parentFormGroup.setControl(nodeEl.entityName, autocompleteNode);
                //     }
                // } else throw new Error('Expected FormGroup for autocomplete but found ' + j2str(autocompleteNode));
            } else if (nodeEl.nodeType === NodeType.form_tabs || nodeEl.nodeType === NodeType.form_table) {
                const childNodes = nodeEl.childNodes || [];
                const arrayCtrl = parentFormGroup.get(nodeEl.tableName);
                if (arrayCtrl == null) {
                    newParent = new FrmdbFormGroup(nodeEl.tableName);
                    parentFormGroup.setControl(nodeEl.tableName, new FormArray([newParent]));
                    this.updateFormGroup(newParent, childNodes, formReadOnly);
                } else if (arrayCtrl instanceof FormArray) {
                    for (const arrayElemCtrl of arrayCtrl.controls) {
                        if (arrayElemCtrl instanceof FormGroup) {
                            this.updateFormGroup(arrayElemCtrl, childNodes, formReadOnly);
                        } else { throw new Error('Expected FormGroup as part of FormArray but found ' + j2str(arrayElemCtrl)); }
                    }
                } else { throw new Error('Expected FormArray for autocomplete but found ' + j2str(arrayCtrl)); }

            }
        }
    }

    private updateFormGroupWithData(objFromServer: DataObj, formGroup: FormGroup, formReadOnly: boolean) {

        // TODO: CONCURRENT-EDITING-CONFLICT-HANDLING (see edit_flow.puml)

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

                objVal.forEach((o, i) => {
                    const formArray = formVal as FormArray;
                    if (formArray.length <= i) {
                        formArray.push(new FormGroup({}));
                    }
                    this.updateFormGroupWithData(o, formArray.at(i) as FormGroup, formReadOnly);
                });

            } else if (/string|boolean|number/.test(typeof objVal) || objVal instanceof Date) {
                if (null == formVal) {
                    formVal = this.makeFormControl(key, { value: undefined, disabled: formReadOnly });
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormControl)) {
                    throw new Error('key ' + key + ', objVal scalar \'' + objVal + '\', but formVal not FormControl: \'' + formVal + '\'');
                }

                formVal.reset(objVal);
            } else if ('object' === typeof objVal) {
                if (null == formVal) {
                    formVal = new FormGroup({});
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormGroup)) {
                    throw new Error('key ' + key + ', objVal object \'' + objVal + '\', but formVal not FormGroup: \'' + formVal + '\'');
                }

                this.updateFormGroupWithData(objVal, formVal, formReadOnly);
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
