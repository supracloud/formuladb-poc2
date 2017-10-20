import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';

import { FormModalService } from '../form-modal.service';
import { Entity } from '../domain/metadata/entity';
import { Property } from "../domain/metadata/property";
import { DataObj } from '../domain/metadata/data_obj';
import { Form, FormElement } from '../domain/uimetadata/form';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';

import { BackendWriteService } from "../backend-write.service";
import * as formState from './form.state';

let snippet: string = `
<ng-container *ngFor="let ELEM of CHILD_NODES">
  <ng-container [ngSwitch]="ELEM.nodeName">
      <div form-grid *ngSwitchCase="'form-grid'">
          NESTED
      </div>
      
      <div form-grid-row *ngSwitchCase="'form-grid-row'">
          NESTED
      </div>
      
      <div form-grid-col *ngSwitchCase="'form-grid-col'">
          NESTED
      </div>
      
      <div form-autocomplete [element]="ELEM" *ngSwitchCase="'form-autocomplete'" [formGroupName]="ELEM.entityName" ngDefaultControl></div>
      
      <div form-input [element]="ELEM" *ngSwitchCase="'form-input'" [formControlName]="ELEM.propertyName" ngDefaultControl></div>
      
      <div *ngSwitchDefault style="border: 1px solid red;">Element NOT KNOWN /{{ELEM.nodeName}}/!</div>
  </ng-container>
</ng-container>
`

@Component({
    moduleId: module.id,
    selector: 'mwz-form',

    template:
    `<form [formGroup]="theFormGroup" novalidate>
      <p>Form status: {{ theFormGroup.status | json }}</p>
      <div form-grid>
  ` +
    snippet.replace(/ELEM/g, 'ELEM_L1').replace(/CHILD_NODES/g, '(form$ | async)?.childNodes').replace(/NESTED/g,
        snippet.replace(/ELEM/g, 'ELEM_L2').replace(/CHILD_NODES/g, 'ELEM_L1.childNodes').replace(/NESTED/g,
            snippet.replace(/ELEM/g, 'ELEM_L3').replace(/CHILD_NODES/g, 'ELEM_L2.childNodes').replace(/NESTED/g,
                snippet.replace(/ELEM/g, 'ELEM_L4').replace(/CHILD_NODES/g, 'ELEM_L3.childNodes').replace(/NESTED/g,
                    snippet.replace(/ELEM/g, 'ELEM_L5').replace(/CHILD_NODES/g, 'ELEM_L4.childNodes')
                )
            )
        )
    ) +
    `</div>
    <p>Form value: {{ theFormGroup.value | json }}</p>
    <p *ngFor="let chg of changes" style="border-bottom: 1px solid black">{{ chg | json }}</p>
  </form>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormComponent implements OnInit {
    private form$: Observable<formState.Form>;
    private formData$: Observable<formState.DataObj>;

    public theFormGroup: FormGroup;
    public changes: any[] = [];
    private tickUsed: boolean = false;
    private lastObj: any;

    constructor(
        private store: Store<formState.State>,
        private formBuilder: FormBuilder,
        private formModalService: FormModalService,
        private backendWriteService: BackendWriteService) {
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
            // this.updateFormData(this.lastObj);
        });

        this.formData$.subscribe(obj => {
            console.log("MwzFormComponent obj from server:", obj);
            this.updateFormData(obj, this.theFormGroup);
            this.lastObj = obj;
        },
            err => console.error(err)
        );

        // Object.keys(this.theFormGroup.controls).forEach(k => {
        //     let control = this.theFormGroup.controls[k];
        //     control.valueChanges.forEach(val => {
        //         if (!x.valid) return;
        //         this.backendWriteService.setFormData(this.theFormGroup.value, x.)
        //     });
        // });

        this.theFormGroup.valueChanges
            .filter(() => this.theFormGroup.valid)
            .sampleTime(500)
            .forEach(val => {
                this.changes.push(val);
                //TODO: send data to validators and backend
            });
    }

    private createFormGroup(parentFormGroup: FormGroup, formEl: FormElement) {
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
