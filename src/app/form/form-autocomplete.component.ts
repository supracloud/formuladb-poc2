import { NodeElement } from './../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup } from '@angular/forms';

import { BaseNodeComponent } from "./base_node";

@Component({
    selector: '[form-autocomplete]',
    host: { style: "margin-left: 15px" },
    template: `
        <label>{{nodeElement.entityName}}</label>
        <div class="form-group col mwz-form-autocomplete" [formGroup]="topLevelFormGroup" *ngFor="let propName of nodeElement.attributes?.copiedProperties">
            <label [for]="nodeElement.propertyName + '/' + propName">{{nodeElement.entityName}}/{{propName}}</label>
            <input class="form-control" type="text" [id]="parentFormPath + '.' + propName" [formControl]="topLevelFormGroup.get(parentFormPath + '.' + propName)" />
        </div>
    `,
    styles: [
        '.mwz-form-autocomplete {margin-left: 25px;}'
    ]
    // providers: [
    //     {
    //         provide: NG_VALUE_ACCESSOR,
    //         useExisting: forwardRef(() => FormAutocompleteComponent),
    //         multi: true
    //     }
    // ]
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, ControlValueAccessor {
    constructor() {
        super();
    }

    private onChange = (_: any) => { }
    private onTouched = () => { }
    private _value = "";

    get value () {
      return this._value;
    }
    set value(v) {
        this._value = v;
        this.onChange(v);
        this.onTouched();
    }
    ngOnInit(): void { 
        // console.log(this.element, this.formGroup);
    }

    writeValue(obj: any): void {
        this._value = obj;
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        throw new Error("MwzInputComponent: Method not implemented.");
    }
}