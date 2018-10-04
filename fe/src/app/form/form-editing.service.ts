import { Injectable, Directive, forwardRef } from '@angular/core';
import { BackendService } from '../backend.service';
import { ValidatorFn, AsyncValidatorFn, ValidationErrors, AsyncValidator, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FrmdbFormControl } from './form.component';
import { DataObj } from './form.state';
import { Observable, Subject, of } from 'rxjs';
import { take, catchError, delay } from 'rxjs/operators';

@Injectable()
export class FormEditingService {

  constructor(private backendService: BackendService) { }

  public getParentObj(control: AbstractControl): DataObj | null {
    let ctrl = control;
    while (ctrl && (!(ctrl instanceof FormGroup) || ctrl.getRawValue()._id == null)) {
      ctrl = ctrl.parent;
    }
    if (ctrl == null || ctrl.getRawValue() == null || ctrl.getRawValue()._id == null) return null;
    return this.backendService.getFrmdbEngineTools().cleanupPropertyTypes(ctrl.getRawValue());
  }

  public propertyValidator() : ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!(control instanceof FrmdbFormControl)) return null;

      let parentObj = this.getParentObj(control);
      if (null == parentObj) return null;

      let tools = this.backendService.getFrmdbEngineTools();
      let ret: {[key: string]: any} = {};

      let failedTypeValidations = tools.validateObjPropertyType(parentObj, control.name, control.value);
      for (let failedValid of failedTypeValidations) {
        ret.failedTypeValidation = failedValid;
      }
      if (failedTypeValidations.length > 0) return ret; 

      let failedValidations = tools.validateObj(parentObj);
      if (failedValidations.length == 0) return null;//no errors

      const regex = new RegExp(`\\w+!${control.name}!\\w+`);
      for (let failedValid of failedValidations) {
        let m = failedValid.validationFullName.match(regex);
        if (null != m) {
          ret[failedValid.validationFullName] = failedValid;
        }
      }
      return ret; 
    };
  }

  private tst$: Subject<ValidationErrors | null> = new Subject();
  public asycValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      setTimeout(() => {
        console.log("finishing async validation for " + control.value);
        this.tst$.next(null);
      }, 1500);
      return this.tst$.pipe(take(1), catchError(err => {
        console.log(err);
        return of(null);
      }));
    }
  }
}
