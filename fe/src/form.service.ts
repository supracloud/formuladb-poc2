import * as _ from 'lodash';

import { DataObj } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE } from './backend.service';
import { serializeElemToObj } from './live-dom-template/live-dom-template';

type InputEl = 
 | HTMLInputElement
 | HTMLSelectElement
 | HTMLTextAreaElement
;
function isFormEl(el: Element): el is InputEl {
    return el instanceof HTMLInputElement
        || el instanceof HTMLSelectElement
        || el instanceof HTMLTextAreaElement
    ;
}

export class FormService {
    
    constructor(private appRoot: HTMLElement) {
        onEvent(appRoot, ["change", "input"], "*", async (event) => {
            let inputEl = event.target;
            if (!isFormEl(inputEl)) throw new Error("input event came from " + event.target);
            this.debounced_manageInput(inputEl);
        });
    }
    
    private debounced_manageInput = _.debounce((inputEl: InputEl) => this.manageInput(inputEl), 500);

    manageInput(inputEl: InputEl) {
        this.validateOnClient(inputEl);

        let dataObj = this.getParentObj(inputEl);
        //TODO: check validity on client side
        //TODO: send to backend
        //TODO: check validity from server
    }
    
    public getParentObj(control: HTMLElement): DataObj {
        let parentObjEl = control.closest('[data-frmdb-record],[data-frmdb-foreach]');
        if (!parentObjEl) throw new Error("Could not get parent of " + control);
        let obj = serializeElemToObj(parentObjEl as HTMLElement) as DataObj;
        if (!obj._id) throw new Error("Cannot find obj id for " + control);
        return obj;
    }
    
    public validateOnClient(control: InputEl) {
        const parentObj = this.getParentObj(control);
        if (null === parentObj) { return null; }
        
        const tools = BACKEND_SERVICE().getFrmdbEngineTools();
        const ret: { [key: string]: any } = {};
        
        const failedTypeValidations = tools.validateObjPropertyType(parentObj, control.name, control.value);
        if (failedTypeValidations) {
            control.setCustomValidity(failedTypeValidations); 
            return;
        }
        
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
