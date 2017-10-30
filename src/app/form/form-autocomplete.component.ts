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
        <label>{{element.entityName}}</label>
        <div class="form-group col mwz-form-autocomplete" [formGroup]="formGroup" *ngFor="let propName of element.attributes?.copiedProperties">
            <label [for]="element.propertyName + '/' + propName">{{element.entityName}}/{{propName}}</label>
            <input class="form-control" type="text" [id]="element.entityName + '/' + propName" [formControlName]="propName" />
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

    @Input() element: NodeElement;
    @Input() formGroup: FormGroup;
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