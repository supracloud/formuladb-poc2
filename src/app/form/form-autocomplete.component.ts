import { NodeElement } from './../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseNodeComponent } from "./base_node";

@Component({
    selector: '[form-autocomplete]',
    host: { class: 'col', style: "padding-left: 25px" },
    template: `
        <label>{{nodeElement.entityName}}</label>
        <div class="form-group mwz-form-autocomplete" [formGroup]="topLevelFormGroup" *ngFor="let propName of nodeElement.attributes?.copiedProperties">
            <label [for]="nodeElement.propertyName + '/' + propName">{{nodeElement.entityName}}/{{propName}}</label>
            <input class="form-control" type="text" [id]="parentFormPath + '.' + propName" 
                [formControl]="topLevelFormGroup.get(parentFormPath + '.' + propName)" 
                *ngIf="hasControl(parentFormPath + '.' + propName)"/>
        </div>
    `,
    styles: [
        '.mwz-form-autocomplete {margin-left: 25px;}'
    ]
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void { 
        console.log(this.nodeElement, this.topLevelFormGroup);
    }

}