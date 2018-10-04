/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive
} from '@angular/core';

import { Location } from '@angular/common';

import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Entity, EntityProperty } from '../common/domain/metadata/entity';
import { DataObj } from '../common/domain/metadata/data_obj';
import { Form, NodeElement, NodeType, FormTab } from '../common/domain/uimetadata/form';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { sampleTime, filter, debounceTime, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as _ from "lodash";

import * as fromForm from './form.state';
import { ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormEditingService } from './form-editing.service';
import { AbstractControlOptions } from '@angular/forms';
import { AsyncValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

export class FrmdbFormControl extends FormControl {
    constructor(public name: string, formState?: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
        super(formState, validatorOrOpts);
    }
}

@Component({
    selector: 'mwz-form',
    templateUrl: 'form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
    public theFormGroup: FormGroup;
    public changes: any[] = [];
    private tickUsed: boolean = false;
    private lastSaveAction: fromForm.UserActionEditedFormData;
    private form$: Observable<Form | null>;
    private formData: DataObj | null;
    private formReadOnly: boolean;
    private saveInProgress: boolean = false;
    private alertType: string = 'success';

    constructor(
        private store: Store<fromForm.FormState>,
        private formEditingService: FormEditingService,
        private _location: Location
    ) {
        try {
            this.theFormGroup = new FormGroup({}, {});
        } catch (ex) {
            console.error(ex);
        }
    }

    ngOnInit() {
        let cmp = this;

        this.store.select(fromForm.getFormReadOnly).subscribe(formReadOnly => {
            this.formReadOnly = formReadOnly;
            if (formReadOnly && !this.theFormGroup.disabled) {
                this.theFormGroup.disable();
            } else if (!formReadOnly && this.theFormGroup.disabled) {
                this.theFormGroup.enable();
            }
        });

        this.form$ = this.store.select(fromForm.getFormState).pipe(tap(
            form => {
                try {
                    if (null == form) return;
                    //set readonly fields
                    this.updateFormGroup(this.theFormGroup, form.grid.childNodes || [], this.formReadOnly);
                } catch (ex) {
                    console.error(ex);
                }
            }
        ));
        this.store.select(fromForm.getFormDataState).subscribe(formData => {
            try {
                this.formData = formData;
                if (formData == null) return;

                this.updateFormGroupWithData(formData, this.theFormGroup, this.formReadOnly);
            } catch (ex) {
                console.error(ex);
            }
        });
    }

    private formulaFieldValidation(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const forbidden = nameRe.test(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
    }

    private makeFormControl(name: string, formState?: any): FormControl {
        let ctrl = new FrmdbFormControl(name, formState, {
            updateOn: 'blur',
            validators: [
                this.formEditingService.propertyValidator()
            ],
            asyncValidators: [
                this.formEditingService.asycValidator()
                // this.testAsyncValidator.validate.bind(this.testAsyncValidator),
            ]
        });

        ctrl.valueChanges.pipe(
            filter(() => !ctrl.disabled && ctrl.dirty && ctrl.valid),
            debounceTime(500)
        )
            .forEach(valueChange => {
                console.log("CHANGEEEEES:", JSON.stringify(valueChange), this.theFormGroup.errors, this.theFormGroup.dirty, this.theFormGroup.status);
                let obj = this.formEditingService.getParentObj(ctrl);
                if (obj == null) {
                    console.warn("Cound not find parent for " + valueChange);
                    return;
                }
                this.lastSaveAction = new fromForm.UserActionEditedFormData(_.cloneDeep(obj));
                this.store.dispatch(this.lastSaveAction);
            });

        return ctrl;
    }

    private updateFormGroup(parentFormGroup: FormGroup, nodeElements: NodeElement[], formReadOnly: boolean) {
        let newParent = parentFormGroup;
        let disabled = formReadOnly;
        for (let nodeEl of nodeElements) {

            if (nodeEl.nodeType == NodeType.form_grid || nodeEl.nodeType == NodeType.form_grid_row || nodeEl.nodeType == NodeType.form_grid_col || nodeEl.nodeType == NodeType.form_tab) {
                let childNodes = nodeEl.childNodes || [];
                this.updateFormGroup(newParent, childNodes, formReadOnly);
            } else if (nodeEl.nodeType == NodeType.form_input || nodeEl.nodeType == NodeType.form_datepicker || nodeEl.nodeType == NodeType.form_timepicker) {
                if (nodeEl.propertyName === 'type_') return;
                if (nodeEl.propertyName === '_id' || nodeEl.propertyName === '_rev') disabled = true;
                if (parentFormGroup.get(nodeEl.propertyName) == null) {
                    parentFormGroup.setControl(nodeEl.propertyName, this.makeFormControl(nodeEl.propertyName, { value: undefined, disabled }));
                }
            } else if (nodeEl.nodeType == NodeType.form_autocomplete) {
                let autocompleteNode = parentFormGroup.get(nodeEl.entityName);
                let madeChanges = false;
                if (autocompleteNode == null) {
                    madeChanges = true;
                    autocompleteNode = new FormGroup({});
                }
                if (autocompleteNode instanceof FormGroup) {                
                    for (let copiedProp of nodeEl.snapshotCurrentValueOfProperties || []) {
                        if (null == autocompleteNode.get(copiedProp)) {
                            autocompleteNode.setControl(copiedProp, this.makeFormControl(copiedProp, { value: undefined, disabled }));
                            madeChanges = true;
                        }
                    }
                    if (madeChanges) {
                        parentFormGroup.setControl(nodeEl.entityName, autocompleteNode);
                    }
                } else throw new Error("Expected FormGroup for autocomplete but found " + JSON.stringify(autocompleteNode));
            } else if (nodeEl.nodeType == NodeType.form_tabs || nodeEl.nodeType == NodeType.form_table) {
                let childNodes = nodeEl.childNodes || [];
                let arrayCtrl = parentFormGroup.get(nodeEl.tableName);
                if (arrayCtrl == null) {
                    let newParent = new FormGroup({});
                    parentFormGroup.setControl(nodeEl.tableName, new FormArray([newParent]));
                    this.updateFormGroup(newParent, childNodes, formReadOnly);
                } else if (arrayCtrl instanceof FormArray) {
                    for (let arrayElemCtrl of arrayCtrl.controls) {
                        if (arrayElemCtrl instanceof FormGroup) {
                            this.updateFormGroup(arrayElemCtrl, childNodes, formReadOnly);
                        } else throw new Error("Expected FormGroup as part of FormArray but found " + JSON.stringify(arrayElemCtrl));
                    }
                } else throw new Error("Expected FormArray for autocomplete but found " + JSON.stringify(arrayCtrl));

            }
        };
    }

    private updateFormGroupWithData(objFromServer: DataObj, formGroup: FormGroup, formReadOnly: boolean) {

        //TODO: CONCURRENT-EDITING-CONFLICT-HANDLING (see edit_flow.puml)

        for (var key in objFromServer) {
            if ('type_' === key) continue;
            // if ('_rev' === key) continue;
            // if ('_id' === key) continue;

            let objVal = objFromServer[key];
            let formVal = formGroup.get(key);
            if (null == objVal) continue;

            if (objVal instanceof Array) {
                if (null == formVal) {
                    formVal = new FormArray([]);
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormArray)) {
                    throw new Error("key " + key + ", objVal Array '" + objVal + "', but formVal not FormArray: '" + formVal + "'");
                }

                objVal.forEach((o, i) => {
                    let formArray = formVal as FormArray;
                    if (formArray.length <= i) {
                        formArray.push(new FormGroup({}));
                    }
                    this.updateFormGroupWithData(o, formArray.at(i) as FormGroup, formReadOnly)
                });

            } else if (/string|boolean|number/.test(typeof objVal) || objVal instanceof Date) {
                if (null == formVal) {
                    formVal = this.makeFormControl(key, { value: undefined, disabled: formReadOnly });
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormControl)) {
                    throw new Error("key " + key + ", objVal scalar '" + objVal + "', but formVal not FormControl: '" + formVal + "'");
                }

                formVal.reset(objVal);
            } else if ('object' === typeof objVal) {
                if (null == formVal) {
                    formVal = new FormGroup({});
                    formGroup.setControl(key, formVal);
                }
                if (!(formVal instanceof FormGroup)) {
                    throw new Error("key " + key + ", objVal object '" + objVal + "', but formVal not FormGroup: '" + formVal + "'");
                }

                this.updateFormGroupWithData(objVal, formVal, formReadOnly);
            } else {
                throw new Error("unkown objVal type: '" + objVal + "'");
            }

        }
    }

    ngAfterViewInit() {
        setTimeout(x => {
            // this.formModalService.sendGridsterFormFinishedRenderingEvent();
        })
    }

    close() {
        // this.formModalService.sendDestroyFormEvent();
    }

    ngOnDestroy() {
        // this.formModalService.sendDestroyFormEvent();
    }

    print(): void {
        console.error("TODO implement Print!");
    }

    /**
     * TODO: make this a proper deep compare function
     * @param a 
     * @param b 
     */
    private areEqual(a, form: FormGroup): boolean {
        for (var key in a) {
            if ('_rev' === key) continue;

            let formVal = (form.get(key) || { value: null }).value;
            if (a[key] != formVal) {
                console.log("DIFFERENCE FOUND ON KEY ", key, a[key], formVal);
                return false;
            }
        }
        return true;
    }

    private goBack() {
        this._location.back();
    }

}
