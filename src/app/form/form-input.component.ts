import { NodeElement } from './../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { BaseNodeComponent } from "./base_node";

@Component({
    selector: '[form-input]',
    host: { class: "col form-group" },
    template: `
        <label [for]="nodeElement.propertyName">{{nodeElement.propertyName}}</label>
        <input class="form-control" type="text" [name]="parentFormPath" 
            [formControl]="topLevelFormGroup.get(parentFormPath)"
            *ngIf="hasControl(parentFormPath)" />
    `
})
export class FormInputComponent extends BaseNodeComponent {

}