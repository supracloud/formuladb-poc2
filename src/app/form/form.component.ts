import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive
} from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';

import { FormModalService } from '../form-modal.service';
import { Entity, Property } from '../domain/metadata/entity';
import { DataObj } from '../domain/metadata/data_obj';
import { Form, NodeElement } from '../domain/uimetadata/form';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';

import * as fromForm from './form.state';

import { BaseObj } from "../domain/base_obj";

@Component({
    selector: 'mwz-form',    
    template:
    `
    <form [formGroup]="theFormGroup" novalidate>
        <p>Form status: {{ theFormGroup.status | json }}</p>
        <div form-item [nodeElement]="(formState$ | async)?.form" [topLevelFormGroup]="theFormGroup" 
            parentFormPath="" [formReadOnly]="formReadOnly$ | async"
            *ngIf="(formState$ | async)?.form">
        </div>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormComponent implements OnInit {
    public theFormGroup: FormGroup;
    public changes: any[] = [];
    private tickUsed: boolean = false;
    private lastObj: BaseObj;
    private formState$: Observable<fromForm.FormState>;

    constructor(
        private store: Store<fromForm.FormState>,
        private formModalService: FormModalService) {
        this.formState$ = store.select(fromForm.getForm);
        try {
            this.theFormGroup = new FormGroup({});
        } catch (ex) {
            console.error(ex);
        }
    }


    ngOnInit() {
        let cmp = this;

        this.formState$.subscribe(formState => {
            console.log("MwzFormComponent:", formState.form, formState.formData, formState.formReadOnly);

            if (formState.form) this.updateFormGroup(this.theFormGroup, formState.form, formState.formReadOnly);
            if (formState.formData) this.updateFormGroupWithData(formState.formData, this.theFormGroup, formState.formReadOnly);

            if (formState.formReadOnly && !this.theFormGroup.disabled) {
                this.theFormGroup.disable();
            } else if (!formState.formReadOnly && this.theFormGroup.disabled) {
                this.theFormGroup.enable();
            }
        });

        this.theFormGroup.valueChanges
            // .filter(() => this.theFormGroup.valid)
            .sampleTime(1000)
            .forEach(val => {
                console.log("CHANGEEEEES:", val, this.theFormGroup.errors, this.theFormGroup.status);
                this.store.dispatch(new fromForm.UserActionEditedFormData(val));
            });
    }

    private updateFormGroup(parentFormGroup: FormGroup, formEl: NodeElement, formReadOnly: boolean) {
        let newParent = parentFormGroup;
        if (null != formEl.tableName) {
            newParent = new FormGroup({});
            parentFormGroup.setControl(formEl.tableName, new FormArray([newParent]));
        }
        else if (null != formEl.entityName) {
            newParent = new FormGroup({});
            parentFormGroup.setControl(formEl.entityName, newParent);
        } if (null != formEl.propertyName) {
            parentFormGroup.setControl(formEl.propertyName, new FormControl({disabled: formReadOnly}));
        }
        if (null != formEl.childNodes) {
            formEl.childNodes.forEach(child => this.updateFormGroup(newParent, child, formReadOnly));
        }
    }

    private updateFormGroupWithData(obj: DataObj, formGroup: FormGroup, formReadOnly: boolean) {
        for (var key in obj) {
            // if ('_rev' === key) continue;

            let objVal = obj[key];
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
                    formVal = new FormControl({disabled: formReadOnly});
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
            this.formModalService.sendGridsterFormFinishedRenderingEvent();
        })
    }

    close() {
        this.formModalService.sendDestroyFormEvent();
    }

    ngOnDestroy() {
        this.formModalService.sendDestroyFormEvent();
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
}
