import {
    Component, OnInit, Input, AfterViewInit, HostListener, ViewChild, EventEmitter, Output,
    ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';

import { FormModalService } from '../form-modal.service';
import { Entity } from '../domain/metadata/entity';
import { Property } from "../domain/metadata/property";
import { DataObj } from '../domain/metadata/data_obj';
import { Form, FormElement } from '../domain/uimetadata/form';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';

import { BackendWriteService } from "../backend-write.service";
import * as formState from './form.state';


@Component({
    moduleId: module.id,
    selector: 'form-item',
    templateUrl: 'form-item.component.html',
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormItemComponent implements OnInit {
    ngOnInit(): void {
        // console.log(this.formItemGroup);
    }
    @Input()
    formEl: FormElement;

    @Input()
    formItemControl?: FormControl;

    @Input()
    formItemGroup: FormGroup;

    @Input()
    formItemArray?: FormArray;
}
