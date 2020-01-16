import * as _ from 'lodash';

import { DataObj, isNewDataObjId } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE } from './backend.service';
import { serializeElemToObj, updateDOM, getEntityPropertyNameFromEl, isFormEl, InputElem, getAllElemsWithDataBindingAttrs } from './live-dom-template/live-dom-template';
import { ServerEventModifiedFormData } from '@domain/event';

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


export function getParentObjId(control: HTMLElement): string | null {
    let parentEl: HTMLElement = control.closest('[data-frmdb-record]') as HTMLElement;
    if (!parentEl) {console.warn("Could not get parent of " + control.outerHTML); return null};
    let ret = parentEl.getAttribute('data-frmdb-record');
    if (!ret) {console.warn("Could not get obj id of parent " + parentEl.outerHTML + " for " + control.outerHTML); return null};
    return ret;
}

export class FormService {
    
    constructor(private appRootEl: HTMLElement) {
        onEvent(appRootEl, ["change", "input"], "*", async (event) => {
            if (event.target.closest('[data-frmdb-ignore-form]') || !appRootEl.contains(event.target)) return;
            let inputEl = event.target;
            if (!isFormEl(inputEl)) return;
            
            this.debounced_newRecordCache(inputEl);
            this.debounced_manageInput(inputEl);
        });

        onEvent(appRootEl, ["click", "submit"], 'button[type="submit"]', async (event) => {
            if (event.target.closest('[data-frmdb-ignore-form]') || !appRootEl.contains(event.target)) return;
            event.preventDefault();
            let button = event.target;
            if (!(button instanceof HTMLButtonElement)) throw new Error("invalid button " + event.target);
            let form: HTMLFormElement | null = button.closest('form');
            if (!form) throw new Error("Form not found for button " + button.outerHTML);
            let inputEl: InputElem | null = form.querySelector('input,select,textarea');
            if (!inputEl) throw new Error("No input found for form " + form.outerHTML);
            let alertEl: HTMLElement | null = form.querySelector('[data-frmdb-submit-status]');
            if (!alertEl) throw new Error("No alert found for form " + form.outerHTML);
    
            this.manageInput(inputEl as InputElem)
            .then(event => {
                if (event) {
                    alertEl!.classList.remove('d-none');
                    if (event.state_ === "ABORT") {
                        alertEl!.innerText = event.error_ || '500 -> Internal Server Error';
                        alertEl!.classList.add('alert-danger');
                        alertEl!.classList.remove('alert-success');
                    } else {
                        alertEl!.innerText = alertEl!.title;
                        alertEl!.classList.add('alert-success');
                        alertEl!.classList.remove('alert-danger');
                    }
                }
            });
        });        
        
    }
    
    private debounced_manageInput = _.debounce((inputEl: InputElem) => this.manageInput(inputEl), 350);
    private debounced_newRecordCache = _.debounce((inputEl: InputElem) => this.putObjInNewRecordCache(inputEl), 100);

    async manageInput(inputEl: InputElem): Promise<ServerEventModifiedFormData|void> {
        let {parentEl, parentObj} = this.getParentObj(inputEl);
        if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }

        if (this.validateOnClient(parentEl, parentObj)) {
            for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                control.dataset.frmdbPending = "";//TODO: set this only on dirty controls
            }
            if (undefined == parentEl.getAttribute('data-frmdb-record-no-autosave')) {
                let event: ServerEventModifiedFormData = await BACKEND_SERVICE().putEvent(new ServerEventModifiedFormData(parentObj)) as ServerEventModifiedFormData;
                for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                    control.dataset.frmdbPending = undefined;
                }
                if (event.state_ === "ABORT") {
                    this.markInvalid(inputEl, event.error_ || 'Internal Server Err');
                    return;
                } else {
                    updateDOM(event.obj, parentEl);
                    if (parentObj._id != event.obj._id) {
                        parentObj._id = event.obj._id;
                        parentEl.setAttribute('data-frmdb-record', parentObj._id);
                    }
                }
                return event;
            }
        }
    }

    private putObjInNewRecordCache(inputEl: InputElem) {
        let parentEl = this.getParentEl(inputEl);
        let parentObjId = parentEl.getAttribute('data-frmdb-record');
        if (parentObjId && isNewDataObjId(parentObjId)) {
            let parentObj = serializeElemToObj(parentEl) as DataObj;

            localStorage.setItem(parentObjId, JSON.stringify({
                _id: parentObjId,
                ...parentObj,
                formNewRecordCacheTimestamp: new Date().getTime()
            }));
        }
    }

    private getObjFromNewRecordCache(objId: string): {_id: string, formNewRecordCacheTimestamp: number} | null {
        let objStr = localStorage.getItem(objId);
        if (!objStr) return null;
        let obj = JSON.parse(objStr);
        if (obj.formNewRecordCacheTimestamp < new Date().getTime() - 20000) return null; 
        return obj; 
    }

    public initFormsFromNewRecordCache() {
        let recordEls = this.appRootEl.querySelectorAll(`[data-frmdb-record]`);
        recordEls.forEach(el => {
            let objId = el.getAttribute('data-frmdb-record') || '';
            if (isNewDataObjId(objId)) {
                let cachedObj = this.getObjFromNewRecordCache(objId);
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

    private getParentEl(control: HTMLElement): HTMLElement {
        let parentEl: HTMLElement = control.closest('[data-frmdb-record]') as HTMLElement;
        if (!parentEl) throw new Error("Could not get parent of " + control);
        return parentEl;
    }

    public getParentObj(control: HTMLElement): {parentEl: HTMLElement, parentObj: DataObj} {
        let parentEl = this.getParentEl(control);
        let parentObj = serializeElemToObj(parentEl) as DataObj;
        parentObj._id = parentEl.getAttribute('data-frmdb-record') || '';
        if (!parentObj._id) throw new Error("Cannot find obj id for " + control);
        return {parentEl, parentObj};
    }

    private markInvalid(el: InputElem, err: string) {
        el.setCustomValidity(err);
        el.title = el.title + "VALIDATION-ERRORS: " + err;
    }

    private markValid(el: InputElem) {
        el.setCustomValidity("");
        el.title = el.title.replace(/VALIDATION-ERRORS: .*/, '');
    }

    public validateOnClient(parentEl: HTMLElement, parentObj: DataObj): boolean {
        const tools = BACKEND_SERVICE().getFrmdbEngineTools();
        
        let formEl: HTMLElement | null = parentEl;
        if (formEl.tagName !== 'FORM') formEl = parentEl.querySelector('form');
        if (formEl) {
            formEl.classList.add('was-validated');
            let alertEl: HTMLElement | null = formEl.querySelector('[data-frmdb-submit-status]');
            if (alertEl) {
                alertEl.classList.add('d-none');
            }
        }


        for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
            if (!isFormEl(control)) { console.log("Only form elements are sent to the server ", control.outerHTML); continue };
            let err = tools.validateObjPropertyType(parentObj, getEntityPropertyNameFromEl(control), control.value);
            if (err) { this.markInvalid(control, err); return false;}
            else this.markValid(control);

            if (!control.validity.valid) return false;
            
            err = tools.validateObj(parentObj);
            if (err) { control.setCustomValidity(err); return false;}
        }

        return true;
    }
}

export const FORM_SERVICE: {instance: FormService | null} = {
    instance: null
};
