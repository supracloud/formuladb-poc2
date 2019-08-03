import * as _ from 'lodash';

import { DataObj, isNewDataObjId } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE } from './backend.service';
import { serializeElemToObj, updateDOM, getEntityPropertyNameFromEl, isFormEl, InputElem } from './live-dom-template/live-dom-template';
import { ServerEventModifiedFormDataEvent } from '@domain/event';

function currentTimestamp() {
    let d = new Date();
    return d.getMilliseconds() 
        + d.getSeconds() * 1000 
        + d.getMinutes() * 1000*100 
        + d.getHours() * 1000*100*100 
        + d.getDay() * 1000*100*100*100 
        + d.getMonth() * 1000*100*100*100
        + d.getFullYear() * 1000*100*100*100*10000
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
    
    private debounced_manageInput = _.debounce((inputEl: InputElem) => this.manageInput(inputEl), 350);

    async manageInput(inputEl: InputElem) {
        let {parentEl, parentObj} = this.getParentObj(inputEl);
        if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }

        this.putObjInCache(parentObj);

        this.validateOnClient(parentObj, inputEl);
        if (inputEl.validity.valid) {
            inputEl.dataset.frmdbPending = "";
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

    }

    private putObjInCache(obj: DataObj) {
        localStorage.setItem(obj._id.replace(/~~.*/, '~~'), JSON.stringify({
            ...obj,
            formCacheTimestamp: new Date().getTime()
        }));
    }

    private getObjFromCache(objId: string): {_id: string, formCacheTimestamp: number} | null {
        let objStr = localStorage.getItem(objId.replace(/~~.*/, '~~'));
        if (!objStr) return null;
        let obj = JSON.parse(objStr);
        if (obj.formCacheTimestamp < new Date().getTime() - 20000) return null;
        return obj;
    }

    public initFormsFromCache() {
        let recordEls = this.appRootEl.querySelectorAll(`[data-frmdb-record]`);
        recordEls.forEach(el => {
            let objId = el.getAttribute('data-frmdb-record') || '';
            if (isNewDataObjId(objId)) {
                let cachedObj = this.getObjFromCache(objId);
                if (cachedObj) updateDOM(cachedObj, el as HTMLElement);
            }
        })
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

    public validateOnClient(parentObj: DataObj, control: InputElem) {
        const tools = BACKEND_SERVICE().getFrmdbEngineTools();
        
        let err = tools.validateObjPropertyType(parentObj, getEntityPropertyNameFromEl(control), control.value);
        if (err) { control.setCustomValidity(err); return;}
        else control.setCustomValidity("");
        
        err = tools.validateObj(parentObj);
        if (err) { control.setCustomValidity(err); return;}
    }
}
