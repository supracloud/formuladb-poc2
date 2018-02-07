import { NodeElement } from './../../domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { BaseNodeComponent } from "./../base_node";

@Component({
    selector: '[form_input]',
    host: { class: "col form_group" },
    templateUrl:'form_input.component.html' ,
    styleUrls:['form_input.component.scss']
})
export class FormInputComponent extends BaseNodeComponent {

}