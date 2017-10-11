import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';

import { FormModalService } from '../form-modal.service';
import { Entity } from '../domain/metadata/entity';
import { DataObj } from '../domain/metadata/data_obj';
import { Form, FormElement } from '../domain/uimetadata/form';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';

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

      <div form-input [element]="ELEM" *ngSwitchCase="'form-input'" [formControlName]="ELEM.attributes.formControlName" ngDefaultControl></div>
      <div *ngSwitchDefault style="border: 1px solid red;">Element NOT KNOWN /{{ELEM.nodeName}}/!</div>
  </ng-container>
</ng-container>
`

@Component({
    moduleId: module.id,
    selector: 'mwz-form',

    template:
    `<form [formGroup]="theFormGroup" novalidate>
      <p>Form value: {{ theFormGroup.value | json }}</p>
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
        private formModalService: FormModalService,
        private formBuilder: FormBuilder) {
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
            this.createFormGroup(frm);
            this.updateFormData(this.lastObj);
        });

        this.formData$.subscribe(obj => {
            console.log("MwzFormComponent obj from server:", obj);
            this.updateFormData(obj);
            this.lastObj = obj;
        },
            err => console.error(err)
        );


        this.theFormGroup.valueChanges.forEach(val => {
            //FIXME: something is not right here, deleted chars come back from the server...not loosing time now to fix it, but a solid solution must be implemented
            if (!this.tickUsed && this.theFormGroup.dirty /*without dirty check we go into an infinite loop*/) {
                this.tickUsed = true;
                setTimeout(() => {
                    this.tickUsed = false;
                    // this.mwzStateService.setObj(this.theFormGroup.value);
                }, 350);//throttle saving
            }
        });
    }

    private createFormGroup(formEl: FormElement) {
        if (null != (formEl.attributes && formEl.attributes.formControlName || null)) {
            this.theFormGroup.addControl(formEl.attributes.formControlName, new FormControl());
        }
        (formEl.childNodes || []).forEach(child => this.createFormGroup(child));
    }

    private updateFormData(obj: any) {
        setTimeout(() => {
            if (this.areEqual(obj, this.theFormGroup)) {
                this.theFormGroup.reset(obj);
            } else {
                this.theFormGroup.setValue(obj);
            }
        }, 250);
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
