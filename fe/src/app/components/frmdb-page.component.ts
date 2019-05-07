/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy, Directive, OnDestroy, OnChanges, ChangeDetectorRef, HostBinding
} from '@angular/core';

import { Location, KeyValue } from '@angular/common';

import { FormControl, FormGroup, FormArray } from '@angular/forms';

import { DataObj } from "@core/domain/metadata/data_obj";
import { NodeElement, NodeType, getChildPath } from "@core/domain/uimetadata/node-elements";
import { Subscription, Observable, merge, combineLatest } from 'rxjs';
import { Entity } from "@core/domain/metadata/entity";
import { filter, debounceTime, tap, map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ValidatorFn } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormEditingService } from './form-editing.service';
import { AbstractControlOptions } from '@angular/forms';
import { AsyncValidatorFn } from '@angular/forms';
import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import { CircularJSON } from '@core/json-stringify';
import { isFormPage } from '@core/domain/uimetadata/form-page';
import { Page } from '@core/domain/uimetadata/page';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { KeyValueObj, HasId } from '@core/domain/key_value_obj';

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
    selector: 'frmdb-page',
    templateUrl: './frmdb-page.component.html',
    styleUrls: ['./frmdb-page.component.scss'],
    host: {
        "novalidate": "",
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrmdbPageComponent implements OnInit, OnDestroy, OnChanges {
    // @HostBinding("formGroup")
    public theFormGroup: FormGroup;

    public formData: DataObj | null;
    public rdonly: boolean;
    public isEditable?: boolean;
    protected subscriptions: Subscription[] = [];
    selectedEntity$: Observable<Entity | undefined>;
    page: Page | null;

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

        this.frmdbStreams.form$.subscribe(f => console.log(f));
        this.selectedEntity$ = this.formEditingService.frmdbStreams.entity$;
        this.frmdbStreams.page$.subscribe(p => console.log(p));
    }

    protected getChildPath(childEl: NodeElement) {
        return getChildPath(childEl);
    }
        
    ngOnInit() {
        combineLatest(this.frmdbStreams.page$, this.frmdbStreams.pageData$, this.frmdbStreams.readonlyMode$)
        .pipe(
            untilDestroyed(this),
            tap(x => console.log(x)),
        ).subscribe(([page, formData, rdonly]) => this.mergePageWithData(page, formData, rdonly));
    }

    mergePageWithData(page: Page, formData: HasId, rdonly: boolean) {
        try {
            if (this.formData && this.formData._id !== formData._id) {
                this.theFormGroup = new FrmdbFormGroup('TOP_LEVEL');
            }
            this.rdonly = rdonly || this.isEditable !== true;
            this.formEditingService.syncReadonly(rdonly, this.theFormGroup);

            this.formEditingService.updateFormGroup(this.theFormGroup, this.theFormGroup, page.childNodes || [], this.rdonly);
            this.formEditingService.updateFormGroupWithData(formData, this.theFormGroup, this.rdonly);
            this.formData = formData;
            this.page = page;
        } catch (ex) {
            console.error(ex);
        }
        console.debug(page, this.page, this.formData, this.theFormGroup);
        
        if (!this.changeDetectorRef['destroyed']) {
            console.debug(page, this.page, this.formData);
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnChanges() {
        console.debug(this.page, this.formData);
    }

    private formulaFieldValidation(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const forbidden = nameRe.test(control.value);
            return forbidden ? { 'forbiddenName': { value: control.value } } : null;
        };
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
