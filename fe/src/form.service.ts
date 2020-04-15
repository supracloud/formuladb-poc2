import * as _ from 'lodash';

import { DataObj, isNewDataObjId, parseDataObjId } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE, postData } from './backend.service';
import { serializeElemToObj, updateDOM, getEntityPropertyNameFromEl, isFormEl, InputElem, getAllElemsWithDataBindingAttrs } from './live-dom-template/live-dom-template';
import { ServerEventModifiedFormData, ServerEventPreComputeFormData } from '@domain/event';
import { Pn, ReferenceToProperty } from '@domain/metadata/entity';
import { AlertComponent } from './alert/alert.component';
import { ThemeColors } from '@domain/uimetadata/theme';

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
            if (!appRootEl.contains(event.target)) return;
            let inputEl = event.target;
            if (!isFormEl(inputEl)) return;

            let pObj = this.getParentObj(inputEl);
            if (!pObj) return;
            let {parentEl, parentObj} = pObj;
            if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }
    
            if (inputEl.closest('form[method="GET]')) {
                //not using localStorage...method=GET means we are using URL parameters
                this.validateOnClient(parentEl, parentObj);
            } else {
                this.debounced_newRecordCache(inputEl);
            }
            this.debounced_manageInput(inputEl);
        });

        onEvent(appRootEl, ["click", "submit"], 'button[type="submit"]', async (event) => {
            if (event.target.closest('[data-frmdb-ignore-form]') || !appRootEl.contains(event.target)) return;
            let button = event.target;
            if (!(button instanceof HTMLButtonElement)) throw new Error("invalid button " + event.target);

            let form: HTMLFormElement | null = button.closest('form');
            if (!form) throw new Error("Form not found for button " + button.outerHTML);
            if (form.getAttribute('method')?.toLowerCase() === 'get') return;

            let inputEl: InputElem | null = form.querySelector('input,select,textarea');
            if (!inputEl) throw new Error("No input found for form " + form.outerHTML);

            let pObj = this.getParentObj(inputEl);
            if (!pObj) return;
            event.preventDefault();

            let alertEl: AlertComponent = form.querySelector('frmdb-alert[data-frmdb-submit-status]') as AlertComponent;
            if (!alertEl) {
                alertEl = document.createElement('frmdb-alert') as AlertComponent;
                alertEl.setAttribute('data-frmdb-submit-status', '');
                alertEl.style.position = 'fixed';
                alertEl.style.top = '0';
                alertEl.style.right = '0';
                alertEl.style.padding = '5px';
                form.appendChild(alertEl);
            } 
    
            this.manageInput(inputEl as InputElem, true)
            .then(event => {
                if (event) {
                    alertEl!.classList.remove('d-none');
                    if (event.state_ === "ABORT") {
                        alertEl.change({
                            severity: ThemeColors.warning,
                            visible: "show",
                            eventTitle: "Error saving form !",
                            eventDetail: event.error_ || '500 -> Internal Server Error',
                        });
                    } else {
                        alertEl.change({
                            severity: ThemeColors.success,
                            visible: "show",
                            eventTitle: "Changes Saved.",
                            eventDetail: '',
                        });
                    }
                }
            });
        });        
        
    }
    
    private debounced_manageInput = _.debounce((inputEl: InputElem) => this.manageInput(inputEl), 350);
    private debounced_newRecordCache = _.debounce((inputEl: InputElem) => this.putObjInNewRecordCache(inputEl), 100);

    async manageInput(inputEl: InputElem, isSubmit?: boolean): Promise<ServerEventModifiedFormData|void> {
        let pObj = this.getParentObj(inputEl);
        if (!pObj) return;
        let {parentEl, parentObj} = pObj;
        if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }

        if (this.validateOnClient(parentEl, parentObj)) {
            for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                control.dataset.frmdbPending = "";//TODO: set this only on dirty controls
            }

            if (inputEl.closest('[data-frmdb-form-autosave]') || isSubmit) {
                let event: ServerEventModifiedFormData = await BACKEND_SERVICE().putEvent(
                    new ServerEventModifiedFormData(parentObj)) as ServerEventModifiedFormData;
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
            } else {
                let entityId = parseDataObjId(parentObj._id).entityId;
                let entity = BACKEND_SERVICE().currentSchema?.entities?.[entityId];
                if (!entity) {console.warn(entityId, "not found"); return}
                let references: {[aliasName: string]: {refs: ReferenceToProperty[], entityName: string}} = {};
                for (let prop of Object.values(entity.props)) {
                    if (prop.propType_ === Pn.REFERENCE_TO) {
                        let ref = references[prop.referencedEntityAlias || prop.referencedEntityName];
                        if (!ref) {
                            ref = {refs: [], entityName: prop.referencedEntityName};
                            references[prop.referencedEntityAlias || prop.referencedEntityName] = ref;
                        }
                        ref.refs.push(prop);
                    }
                }
            
                for (let [aliasName, refsForEntity] of Object.entries(references)) {   
                    await this.updateDomForReference(aliasName, parentEl, parentObj);
                }
            }
        }
    }

    public async updateDomForReference(aliasName: string, el: HTMLElement, obj: DataObj) {
        let options: DataObj[] = await postData(
            `/formuladb-api/${BACKEND_SERVICE().appName}/reference_to_options/${aliasName}`,
            new ServerEventPreComputeFormData(obj)
        );

        if (!el.parentElement) {console.warn('update dom for references table called for element without parent', el); return}
        let limit = parseInt(el.getAttribute('data-frmdb-table-limit') || '') || 3;
        updateDOM({
            $FRMDB: {
                $REFERENCE_TO_OPTIONS: {
                    [aliasName]: options.slice(0, limit),
                }
            }
        }, el.parentElement);
    }

    public async updateOptionsForEl(el: HTMLElement) {
        let attr = el.getAttribute('data-frmdb-table');
        if (!attr) {console.warn("data-frmdb-table attribute not found for ", el); return;}
        let tableAlias = attr.replace(/^\$FRMDB\.\$REFERENCE_TO_OPTIONS\./, '').replace(/\[\]$/, '');
        let pObj = this.getParentObj(el);
        if (!pObj?.parentObj) {console.warn("parent record not found for ", el); return;}
        await this.updateDomForReference(tableAlias, el, pObj?.parentObj);
    }

    private putObjInNewRecordCache(inputEl: InputElem) {
        let parentEl = this.getParentEl(inputEl);
        if (!parentEl) return;
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

    private getParentEl(control: HTMLElement): HTMLElement | null {
        let parentEl: HTMLElement = control.closest('[data-frmdb-record]') as HTMLElement;
        if (!parentEl) return null;
        return parentEl;
    }

    public getParentObj(control: HTMLElement): {parentEl: HTMLElement, parentObj: DataObj} | null {
        let parentEl = this.getParentEl(control);
        if (!parentEl) return null;
        let parentObj = serializeElemToObj(parentEl) as DataObj;
        let recordId = parentEl.getAttribute('data-frmdb-record') || '';
        if (recordId != '' && recordId != '$AUTOID' && !parentObj._id) {
            parentObj._id = recordId;
        }
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
