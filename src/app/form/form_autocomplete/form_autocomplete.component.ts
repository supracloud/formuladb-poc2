import { NodeElement } from './../../common/domain/uimetadata/form';
import {
    Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone,
    Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, HostBinding,
    forwardRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseNodeComponent } from "./../base_node";

@Component({
    selector: '[form_autocomplete]',
    host: { class: 'col', style: "padding-left: 25px" },
    templateUrl: 'form_autocomplete.component.html',
    styleUrls: ['./../form_input/form_input.component.scss', 'form_autocomplete.component.scss']
})
export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit {
    constructor() {
        super();
    }

    ngOnInit(): void {
        console.log(this.nodeElement, this.topLevelFormGroup);
    }

}