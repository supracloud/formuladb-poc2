import { Injectable } from '@angular/core';
import { BackendService } from '../backend.service';
import { ValidatorFn, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FrmdbFormControl } from './form.component';
import { DataObj } from './form.state';
import { Observable, Subject, of, from, BehaviorSubject } from 'rxjs';
import { take, catchError, delay, map } from 'rxjs/operators';

@Injectable()
export class FormEditingService {

  constructor(private backendService: BackendService) { }

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

  public getOptions(entity: string, property: string, startWith: string): Observable<any[]> {
    return from(this.backendService.getTableData(entity)).pipe(
      map(d => d.filter(dx => dx[property].startsWith(startWith)))
    );
  }

  public getAutoComplete(entity: string): BehaviorSubject<any> {
    if (!this.autoComplete$[entity]) {
      this.autoComplete$[entity] = new BehaviorSubject(null);
    }
    return this.autoComplete$[entity];
  }
}
