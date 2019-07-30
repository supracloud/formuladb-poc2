import * as _ from 'lodash';

import { DataObj } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE } from './backend.service';

type FormEl = 
 | HTMLInputElement
 | HTMLSelectElement
 | HTMLTextAreaElement
;
function isFormEl(el: Element): el is FormEl {
    return el instanceof HTMLInputElement
        || el instanceof HTMLSelectElement
        || el instanceof HTMLTextAreaElement
    ;
}

export class FormService {
    
    constructor(private appRoot: HTMLElement) {
        onEvent(appRoot, ["change", "input"], "*", async (event) => {
            let formEl = event.target;
            if (!isFormEl(formEl)) throw new Error("input event came from " + event.target);
            this.debounced_manageInput(formEl);
        });
    }
    
    private debounced_manageInput = _.debounce((formEl: FormEl) => this.manageInput(formEl), 500);

    manageInput(formEl: FormEl) {
        //TODO: check validity on client side
        //TODO: send to backend
        //TODO: check validity from server
    }
    
    public getParentObj(control: HTMLElement): DataObj {
        let parentObjEl = control.closest('[data-frmdb-foreach],[data-frmdb-obj]');
        if (!parentObjEl) throw new Error("Could not get parent of " + control);
        return this.el2Obj(parentObjEl);
    }

    public el2Obj(el: Element): DataObj {
        return {_id: "TODO: must scan all data bindings and construct DataObj"}
    }
    
    
    public validateonClient(control: FormEl) {
        const parentObj = this.getParentObj(control);
        if (null === parentObj) { return null; }
        
        const tools = BACKEND_SERVICE().getFrmdbEngineTools();
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
    
    }
}
