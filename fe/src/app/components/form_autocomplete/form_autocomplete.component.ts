/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';

import { BaseNodeComponent } from '../base_node';

import { FormAutocomplete, NodeType } from "@core/domain/uimetadata/form";
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';
import { FormEditingService } from '../form-editing.service';
import { Pn } from '@core/domain/metadata/entity';
import { CircularJSON } from '@core/json-stringify';

export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete;

    userInput$ = new BehaviorSubject('');

    value$: Observable<string>;

    optionsFn$: (search: string) => Observable<any[]>;

    options: string[] = [];

    selection$: Subject<any>;

    spotOptions: any[];

    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormAutocomplete;
        this.subscriptions.push(this.userInput$.subscribe(async (userInput) => {
            let referencedRows = await this.formEditingService.getOptions(this.inputElement.refEntityName, this.inputElement.refPropertyName, userInput);
            this.options = referencedRows.map(row => row[this.inputElement.refPropertyName]);
        }))

        this.selection$ = this.formEditingService.getAutoComplete(this.inputElement.refEntityName);
        this.subscriptions.push(
            this.selection$.pipe(
                filter(s => s !== null && s !== undefined),
                map(s => s[this.inputElement.refPropertyName])
            ).subscribe(x => {
                let ctrl = this.topLevelFormGroup.get(this.parentFormPath);
                if (!ctrl) throw new Error("Control not found for autocomplete " + CircularJSON.stringify(this.topLevelFormGroup) + ", " + this.parentFormPath);
                ctrl.reset(x);
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    inputChange(val: string) {
        if (val.length > 2) {
            this.userInput$.next(val);
        }
    }

    inputLeave(val: string) {
        const option = this.spotOptions.find(opt => opt[this.inputElement.refPropertyName] === val);
        if (option) { this.selection$.next(option); }
    }
}
