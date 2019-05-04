import { Injectable, ChangeDetectorRef } from '@angular/core';
import { BackendService } from '../effects/backend.service';
import { ValidatorFn, AsyncValidatorFn, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FrmdbFormControl, FrmdbFormGroup } from './frmdb-page.component';
import { DataObj } from '../state/form.state';
import { Observable, Subject, of, from, BehaviorSubject } from 'rxjs';
import { take, catchError, delay, map, filter, debounceTime, tap } from 'rxjs/operators';
import { j2str } from '../crosscutting/utils/j2str';
import { UserModifiedFormData } from '../state/frmdb-user-events';
import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import * as _ from 'lodash';
import { NodeType, NodeElement, FormAutocomplete } from '@core/domain/uimetadata/node-elements';
import { SimpleAddHocQuery } from '@core/key_value_store_i';
import { Entity } from '@core/domain/metadata/entity';

export class RelatedAutoCompleteControls {
  controls: {[refPropertyName: string]: FormAutocomplete} = {};
  options: {}[] = [];
  selectedOption: {} | null;
}

@Injectable()
export class FormEditingService {
  public formChangeDetectorRef: ChangeDetectorRef;

  constructor(
    private backendService: BackendService, 
    public frmdbStreams: FrmdbStreamsService,
  ) {
  }

  private tst$: Subject<ValidationErrors | null> = new Subject();

  public getParentObj(control: AbstractControl): DataObj | null {
    let ctrl = control;
    while (ctrl && (!(ctrl instanceof FormGroup) || ctrl.getRawValue()._id == null)) {
      ctrl = ctrl.parent;
    }
    if (ctrl === null || ctrl === undefined || ctrl.getRawValue() === null || ctrl.getRawValue()._id === null) { return null; }
    return this.backendService.getFrmdbEngineTools().cleanupPropertyTypes(ctrl.getRawValue());
  }


  public makeFormControl(formgrp: FormGroup, name: string, formState?: any): FormControl {
    const ctrl = new FrmdbFormControl(name, formState, {
      updateOn: 'blur',
      validators: [
        this.propertyValidator()
      ],
      asyncValidators: [
        // this.asycValidator()
        // this.testAsyncValidator.validate.bind(this.testAsyncValidator),
      ]
    });

    ctrl.valueChanges.pipe(
      tap(x => console.debug("FrmdbFormControl " + name + " changed to " + x, ctrl.disabled, ctrl.dirty, ctrl.valid)),
      filter(() => !ctrl.disabled && ctrl.dirty && ctrl.valid),
      debounceTime(500)
    )
      .forEach(valueChange => {
        console.log('CHANGEEEEES:', j2str(valueChange),
          formgrp.errors, formgrp.dirty, formgrp.status);
        const obj = this.getParentObj(ctrl);
        if (obj == null) {
          console.warn('Cound not find parent for ' + valueChange);
          return;
        }
        let lastSaveEvent: UserModifiedFormData = { type: "UserModifiedFormData", obj: _.cloneDeep(obj) };
        this.frmdbStreams.userEvents$.next(lastSaveEvent);
      });

    return ctrl;
  }


  public updateFormGroup(formgrp: FormGroup, parentFormGroup: FormGroup, nodeElements: NodeElement[], rdonly: boolean) {
    let newParent = parentFormGroup;
    let disabled = rdonly;
    for (const nodeEl of nodeElements) {

      if (nodeEl.nodeType === NodeType.root_node
        || nodeEl.nodeType === NodeType.grid_row
        || nodeEl.nodeType === NodeType.grid_col
      ) {
        const childNodes = nodeEl.childNodes || [];
        this.updateFormGroup(formgrp, newParent, childNodes, rdonly);
      } else if (nodeEl.nodeType === NodeType.form_input
        || nodeEl.nodeType === NodeType.form_autocomplete
        || nodeEl.nodeType === NodeType.form_datepicker
        || nodeEl.nodeType === NodeType.form_timepicker
        || nodeEl.nodeType === NodeType.form_text
      ) {
        if (nodeEl.propertyName === 'type_') { return; }
        if (nodeEl.propertyName === '_id' || nodeEl.propertyName === '_rev') { disabled = true; }
        if (parentFormGroup.get(nodeEl.propertyName) == null) {
          parentFormGroup.setControl(nodeEl.propertyName,
            this.makeFormControl(formgrp, nodeEl.propertyName, { value: undefined, disabled: rdonly }));
        }
      } else if (nodeEl.nodeType === NodeType.form_tabs || nodeEl.nodeType === NodeType.form_table) {
        const childNodes = nodeEl.childNodes || [];
        const arrayCtrl = parentFormGroup.get(nodeEl.tableName);
        if (arrayCtrl == null) {
          newParent = new FrmdbFormGroup(nodeEl.tableName);
          parentFormGroup.setControl(nodeEl.tableName, new FormArray([newParent]));
          this.updateFormGroup(formgrp, newParent, childNodes, rdonly);
        } else if (arrayCtrl instanceof FormArray) {
          for (const arrayElemCtrl of arrayCtrl.controls) {
            if (arrayElemCtrl instanceof FormGroup) {
              this.updateFormGroup(formgrp, arrayElemCtrl, childNodes, rdonly);
            } else { throw new Error('Expected FormGroup as part of FormArray but found ' + j2str(arrayElemCtrl)); }
          }
        } else {
          throw new Error('Expected FormArray for autocomplete but found ' + j2str(arrayCtrl));
        }

      }
    }
  }

  public propertyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!(control instanceof FrmdbFormControl)) { return null; }

      const parentObj = this.getParentObj(control);
      if (null === parentObj) { return null; }

      const tools = this.backendService.getFrmdbEngineTools();
      const ret: { [key: string]: any } = {};

      const failedTypeValidations = tools.validateObjPropertyType(parentObj, control.name, control.value);
      for (const failedValid of failedTypeValidations) {
        ret.failedTypeValidation = failedValid;
      }
      if (failedTypeValidations.length > 0) { return ret; }

      const failedValidations = tools.validateObj(parentObj);
      if (failedValidations.length === 0) { return null; } // no errors

      const regex = new RegExp(`\\w+!${control.name}!\\w+`);
      for (const failedValid of failedValidations) {
        const m = failedValid.validationFullName.match(regex);
        if (null != m) {
          ret[failedValid.validationFullName] = failedValid;
        }
      }
      return ret;
    };
  }

  public asycValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      setTimeout(() => {
        // console.log("finishing async validation for " + control.value);
        this.tst$.next(null);
      }, 1500);
      return this.tst$.pipe(take(1), catchError(err => {
        // console.log(err);
        return of(null);
      }));
    };
  }

}
