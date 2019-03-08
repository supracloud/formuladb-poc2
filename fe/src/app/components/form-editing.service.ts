import { Injectable, ChangeDetectorRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { ValidatorFn, AsyncValidatorFn, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FrmdbFormControl, FrmdbFormGroup } from './form.component';
import { DataObj } from './form.state';
import { Observable, Subject, of, from, BehaviorSubject } from 'rxjs';
import { take, catchError, delay, map, filter, debounceTime } from 'rxjs/operators';
import { j2str } from '../crosscutting/utils/j2str';
import { UserModifiedFormData } from '../frmdb-streams/frmdb-user-events';
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';
import * as _ from 'lodash';
import { NodeType, NodeElement, FormAutocomplete } from '@core/domain/uimetadata/form';
import { SimpleAddHocQuery } from '@core/key_value_store_i';

@Injectable()
export class FormEditingService {
  public formChangeDetectorRef: ChangeDetectorRef;

  constructor(
    private backendService: BackendService, 
    public frmdbStreams: FrmdbStreamsService,
  ) { }

  private tst$: Subject<ValidationErrors | null> = new Subject();

  private autoComplete$: { [entity: string]: BehaviorSubject<any> } = {};

  public getParentObj(control: AbstractControl): DataObj | null {
    let ctrl = control;
    while (ctrl && (!(ctrl instanceof FormGroup) || ctrl.getRawValue()._id == null)) {
      ctrl = ctrl.parent;
    }
    if (ctrl === null || ctrl === undefined || ctrl.getRawValue() === null || ctrl.getRawValue()._id === null) { return null; }
    return this.backendService.getFrmdbEngineTools().cleanupPropertyTypes(ctrl.getRawValue());
  }


  public makeFormControl(topLevelFormGroup: FormGroup, name: string, formState?: any): FormControl {
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
      filter(() => !ctrl.disabled && ctrl.dirty && ctrl.valid),
      debounceTime(500)
    )
      .forEach(valueChange => {
        console.log('CHANGEEEEES:', j2str(valueChange),
          topLevelFormGroup.errors, topLevelFormGroup.dirty, topLevelFormGroup.status);
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


  public updateFormGroup(topLevelFormGroup: FormGroup, parentFormGroup: FormGroup, nodeElements: NodeElement[], formReadOnly: boolean) {
    let newParent = parentFormGroup;
    let disabled = formReadOnly;
    for (const nodeEl of nodeElements) {

      if (nodeEl.nodeType === NodeType.form_grid
        || nodeEl.nodeType === NodeType.h_layout
        || nodeEl.nodeType === NodeType.v_layout
        || nodeEl.nodeType === NodeType.form_tab) {
        const childNodes = nodeEl.childNodes || [];
        this.updateFormGroup(topLevelFormGroup, newParent, childNodes, formReadOnly);
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
            this.makeFormControl(topLevelFormGroup, nodeEl.propertyName, { value: undefined, disabled: formReadOnly }));
        }
      } else if (nodeEl.nodeType === NodeType.form_tabs || nodeEl.nodeType === NodeType.form_table) {
        const childNodes = nodeEl.childNodes || [];
        const arrayCtrl = parentFormGroup.get(nodeEl.tableName);
        if (arrayCtrl == null) {
          newParent = new FrmdbFormGroup(nodeEl.tableName);
          parentFormGroup.setControl(nodeEl.tableName, new FormArray([newParent]));
          this.updateFormGroup(topLevelFormGroup, newParent, childNodes, formReadOnly);
        } else if (arrayCtrl instanceof FormArray) {
          for (const arrayElemCtrl of arrayCtrl.controls) {
            if (arrayElemCtrl instanceof FormGroup) {
              this.updateFormGroup(topLevelFormGroup, arrayElemCtrl, childNodes, formReadOnly);
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

  public getOptions(entityName: string, property: string, startWith: string): Promise<any[]> {
    return this.backendService.simpleAdHocQuery(entityName, {
      startRow: 0,
      endRow: 25,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: {
          [property]: {
              type: "contains",
              filter: startWith,
              filterType: "text"
          }
      },
      sortModel: [],
    } as SimpleAddHocQuery);
  }

  public getAutoComplete(entity: string): BehaviorSubject<any> {
    if (!this.autoComplete$[entity]) {
      this.autoComplete$[entity] = new BehaviorSubject(null);
    }
    return this.autoComplete$[entity];
  }


}
