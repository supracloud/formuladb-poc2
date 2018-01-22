import { NodeElement } from './../../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { BaseNodeComponent } from "./../base_node";

@Component({
    selector: '[form-input]',
    host: { class: "col form-group" },
    templateUrl:'form-input.component.html' ,
    styleUrls:['form-input.component.scss']
})
export class FormInputComponent extends BaseNodeComponent {

}