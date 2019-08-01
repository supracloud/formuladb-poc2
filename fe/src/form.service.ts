import * as _ from 'lodash';

import { DataObj, isNewDataObjId } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE } from './backend.service';
import { serializeElemToObj, updateDOM } from './live-dom-template/live-dom-template';
import { ServerEventModifiedFormDataEvent } from '@domain/event';

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
    
    constructor(private appRootEl: HTMLElement) {
        onEvent(appRootEl, ["change", "input"], "*", async (event) => {
            let inputEl = event.target;
            if (!isFormEl(inputEl)) throw new Error("input event came from " + event.target);
            this.debounced_manageInput(inputEl);
        });
    }
    
    private debounced_manageInput = _.debounce((inputEl: InputEl) => this.manageInput(inputEl), 350);

    async manageInput(inputEl: InputEl) {
        let {parentEl, parentObj} = this.getParentObj(inputEl);
        if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }

        this.validateOnClient(parentObj, inputEl);
        if (inputEl.validity.valid) {
            inputEl.dataset.frmdPending = "";
            let event: ServerEventModifiedFormDataEvent = await BACKEND_SERVICE().putEvent(new ServerEventModifiedFormDataEvent(parentObj)) as ServerEventModifiedFormDataEvent;
            inputEl.dataset.frmdbPending = undefined;
            if (event.state_ === "ABORT") {
                inputEl.setCustomValidity(event.reason_ || event.notifMsg_ || 'Internal Server Err');
                return;
            } else {
                updateDOM(event.obj, parentEl);
                parentObj._id = event.obj._id;
            }
        }

        if (isNewDataObjId(parentObj._id) && !inputEl.validity.valid) {
            localStorage.setItem(parentObj._id, JSON.stringify(parentObj));
        }
    }
    
    public updateRecordDOM<T extends DataObj>(obj: T) {
        let recordEls = this.appRootEl.querySelectorAll(`[data-frmdb-record="${obj._id}"]`);
        recordEls.forEach(el => {
            updateDOM(obj, el as HTMLElement);
        })

    }

    public getParentObj(control: HTMLElement): {parentEl: HTMLElement, parentObj: DataObj} {
        let parentEl: HTMLElement = control.closest('[data-frmdb-record]') as HTMLElement;
        if (!parentEl) throw new Error("Could not get parent of " + control);
        let parentObj = serializeElemToObj(parentEl) as DataObj;
        if (!parentObj._id) parentObj._id = parentEl.getAttribute('data-frmdb-record') || '';
        if (!parentObj._id) throw new Error("Cannot find obj id for " + control);
        return {parentEl, parentObj};
    }
    
    public validateOnClient(parentObj: DataObj, control: InputEl) {
        const tools = BACKEND_SERVICE().getFrmdbEngineTools();
        
        let err = tools.validateObjPropertyType(parentObj, control.name, control.value);
        if (err) { control.setCustomValidity(err); return;}
        
        err = tools.validateObj(parentObj);
        if (err) { control.setCustomValidity(err); return;}
    }
}
