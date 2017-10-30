import { NodeElement } from './../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseNodeComponent } from "./base_node";

@Component({
    selector: '[form-input]',
    host: { class: "form-group col" },
    template: `
        <label [for]="element.propertyName">{{element.propertyName}}</label>
        <input class="form-control" type="text" [id]="element.propertyName" [(ngModel)]="value" />
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FormInputComponent),
            multi: true
        }
    ]
})
export class FormInputComponent extends BaseNodeComponent implements OnInit, ControlValueAccessor {
    constructor() { 
        super();
    }

    @Input() element: NodeElement;
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
    ngOnInit(): void { }

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