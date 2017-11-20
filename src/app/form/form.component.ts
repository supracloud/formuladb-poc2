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
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import * as _ from "lodash";

import * as fromForm from './form.state';

import { BaseObj } from "../domain/base_obj";

@Component({
    selector: 'mwz-form',    
    template:
    `
    <form [formGroup]="theFormGroup" novalidate>
        <ngb-alert [type]="alertType" [dismissible]="false">
            Form status: {{ theFormGroup.status | json }}
            <i *ngIf="saveInProgress" class="fa fa-spinner fa-spin" style="font-size:24px"></i>
        </ngb-alert>
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
    private lastSaveAction: fromForm.UserActionEditedFormData;
    private formState$: Observable<fromForm.FormState>;
    private saveInProgress: boolean = false;
    private alertType: string = 'success';

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

            //set readonly fields
            this.theFormGroup.setControl('_id', new FormControl({value: (formState.formData || {_id: null})._id, disabled: true}));
            this.theFormGroup.setControl('_rev', new FormControl({value: (formState.formData || {_rev: null})._rev, disabled: true}));
            this.theFormGroup.setControl('mwzType', new FormControl({value: (formState.formData || {mwzType: null}).mwzType, disabled: true}));
            

            if (formState.form) this.updateFormGroup(this.theFormGroup, formState.form, formState.formReadOnly);
            if (formState.formData) this.updateFormGroupWithData(formState.formData, this.theFormGroup, formState.formReadOnly);

            if (formState.formReadOnly && !this.theFormGroup.disabled) {
                this.theFormGroup.disable();
            } else if (!formState.formReadOnly && this.theFormGroup.disabled) {
                this.theFormGroup.enable();
            }

            if (formState.eventFromBackend && this.lastSaveAction && formState.eventFromBackend._id === this.lastSaveAction.event._id) {
                //TODO: show errors
                this.saveInProgress = false;
            }

            this.setAlertType();
        });

        this.theFormGroup.valueChanges
            // .filter(() => this.theFormGroup.valid) //FIXME: why is the form always invalid for ServiceForm?
            // .filter(() => !this.theFormGroup.dirty)
            // .filter(val => val._id.disabled === false)
            .sampleTime(1000)
            .forEach(valueChange => {
                let val = this.theFormGroup.getRawValue();
                if (val._id && val._id.disabled === false) return;//FIXME: WTF! sometimes all fields are {disabled: false}
                if (!this.theFormGroup.dirty) return;
                
                delete val._revisions;//WORKAROUND for error: "doc_validation", reason: "RevId isn't a string", status: 400, name: "doc_validation", message: "RevId isn't a string",

                console.log("CHANGEEEEES:", val, this.theFormGroup.errors, this.theFormGroup.dirty, this.theFormGroup.status);
                this.lastSaveAction = new fromForm.UserActionEditedFormData(_.cloneDeep(val));
                this.store.dispatch(this.lastSaveAction);
                this.saveInProgress = true;
                this.setAlertType();
            });
    }

    private setAlertType() {
        if (this.saveInProgress) this.alertType = 'info';
        else if (this.theFormGroup.valid) this.alertType = 'success';
        else this.alertType = 'warning';
    }

    private updateFormGroup(parentFormGroup: FormGroup, formEl: NodeElement, formReadOnly: boolean) {
        let newParent = parentFormGroup;
        if (null != formEl.tableName) {
            newParent = new FormGroup({});
            parentFormGroup.setControl(formEl.tableName, new FormArray([newParent]));
        } else if (null != formEl.entityName) {
            newParent = new FormGroup({});
            parentFormGroup.setControl(formEl.entityName, newParent);
        } else if (null != formEl.propertyName) {
            if (formEl.propertyName === '_id') return;
            if (formEl.propertyName === '_rev') return;
            if (formEl.propertyName === 'mwzType') return;
            parentFormGroup.setControl(formEl.propertyName, new FormControl({value: undefined, disabled: formReadOnly}));
        } 
        
        if (null != formEl.childNodes) {
            formEl.childNodes.forEach(child => this.updateFormGroup(newParent, child, formReadOnly));
        }
    }

    private updateFormGroupWithData(objFromServer: DataObj, formGroup: FormGroup, formReadOnly: boolean) {

        //TODO: CONCURRENT-EDITING-CONFLICT-HANDLING (see edit_flow.puml)

        for (var key in objFromServer) {
            if ('_rev' === key) continue;
            if ('_id' === key) continue;
            if ('mwzType' === key) continue;
            
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
                    formVal = new FormControl({value: undefined, disabled: formReadOnly});
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
