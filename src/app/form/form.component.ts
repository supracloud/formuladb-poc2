import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive
} from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
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

import * as formState from './form.state';

import { BaseObj } from "../domain/base_obj";

@Component({
    selector: 'mwz-form',    
    template:
    `
    <form [formGroup]="theFormGroup" novalidate>
        <p>Form status: {{ theFormGroup.status | json }}</p>
        <div form-item [nodeElement]="form$ | async" [topLevelFormGroup]="theFormGroup" parentFormPath="">
        </div>
    </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormComponent implements OnInit {
    private form$: Observable<formState.Form>;
    private formData$: Observable<formState.DataObj>;

    public theFormGroup: FormGroup;
    public changes: any[] = [];
    private tickUsed: boolean = false;
    private lastObj: BaseObj;
    private lastSavedObj: BaseObj;

    constructor(
        private store: Store<formState.FormState>,
        private formBuilder: FormBuilder,
        private formModalService: FormModalService) {
        try {
            this.form$ = store.select(formState.getFormState);
            this.formData$ = store.select(formState.getFormDataState);

            this.theFormGroup = new FormGroup({});
        } catch (ex) {
            console.error(ex);
        }
    }


    ngOnInit() {
        let cmp = this;
        this.form$.subscribe(frm => {
            console.log("MwzFormComponent frm:", frm);
            this.createFormGroup(this.theFormGroup, frm);
            console.log("MwzFormComponent this.theFormGroup:", this.theFormGroup);
            // this.updateFormData(this.lastObj);
        });

        this.formData$.subscribe(obj => {
            console.log("MwzFormComponent obj from server:", obj);
            this.updateFormData(obj, this.theFormGroup);
            this.lastObj = obj;
        },
            err => console.error(err)
        );

        // this.appStateS.formDataUpdatesFromServer$.subscribe((objFromServer: DataObj) => {
        //     this.updateFormDataFromServer(objFromServer);
        // });

        this.theFormGroup.valueChanges
            // .filter(() => this.theFormGroup.valid)
            .sampleTime(2000)
            .forEach(val => {
                console.log("CHANGEEEEES:", val, this.theFormGroup.errors, this.theFormGroup.status);
                // this.appStateS.put(val._id, val).then(doc => this.lastSavedObj = doc);
            });
    }

    private createFormGroup(parentFormGroup: FormGroup, formEl: NodeElement) {
        let newParent = parentFormGroup;
        if (null != formEl.tableName) {
            newParent = new FormGroup({});
            parentFormGroup.addControl(formEl.tableName, new FormArray([newParent]));
        }
        else if (null != formEl.entityName) {
            newParent = new FormGroup({});
            parentFormGroup.addControl(formEl.entityName, newParent);
        } if (null != formEl.propertyName) {
            parentFormGroup.addControl(formEl.propertyName, new FormControl());
        }
        if (null != formEl.childNodes) {
            formEl.childNodes.forEach(child => this.createFormGroup(newParent, child));
        }
    }

    private updateFormDataFromServer(objFromServer: DataObj) {
        this.updateFormData(objFromServer, this.theFormGroup);

        //FIXME: update only delta, don't loose the user's edits!!!
        // let currentPath = '';
        // for (var key in objFromServer) {
        //     let objValFromServer = objFromServer[key];

        //     if (objValFromServer instanceof Array) {
        //         objValFromServer.forEach((childObjFromServer, idx) => {

        //         });
        //     } else if (/string|boolean|number/.test(typeof objValFromServer) || objValFromServer instanceof Date) {
        //     } else if ('object' === typeof objValFromServer) {
        //     } else {
        //         throw new Error("unkown objValFromServer type: '" + objValFromServer + "'");
        //     }
                
        // }        
    }
    private updateFormData(obj: DataObj, formGroup: FormGroup) {
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
                    this.updateFormData(o, formArray.at(i) as FormGroup)
                });
                
            } else if (/string|boolean|number/.test(typeof objVal) || objVal instanceof Date) {
                if (null == formVal) {
                    formVal = new FormControl();
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

                this.updateFormData(objVal, formVal);
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
