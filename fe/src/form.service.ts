import * as _ from 'lodash';

import { DataObj, isNewDataObjId, parseDataObjId, entityNameFromDataObjId } from '@domain/metadata/data_obj';
import { onEvent } from './delegated-events';
import { BACKEND_SERVICE, postData } from './backend.service';
import { serializeElemToObj, getEntityPropertyNameFromEl, isFormEl, InputElem, getAllElemsWithDataBindingAttrs } from './live-dom-template/live-dom-template';
import { ServerEventModifiedFormData, ServerEventPreComputeFormData } from '@domain/event';
import { Pn, ReferenceToProperty } from '@domain/metadata/entity';
import { AlertComponent } from './alert/alert.component';
import { ThemeColors } from '@domain/uimetadata/theme';
import { validateAndCovertObjPropertyType } from '@core/validate-schema-types';
import { scalarFormulaEvaluate } from '@core/scalar_formula_evaluate';
import { updateDOM } from '@fe/live-dom-template/live-dom-template';
import { $FRMDB_RECORD, $FRMDB_RECORD_EL } from './fe-functions';
import { DATA_FRMDB_ATTRS_Enum } from '@core/live-dom-template/dom-node';
import { raiseSingletonNotification, removeSingletonNotification } from './notifications.service';
import { I18N } from './i18n.service';
import { FailedValidation, getUserError } from '@domain/errors';
import { _idAsStr, KeyValueObjIdType } from '@domain/key_value_obj';

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
    let parentEl: HTMLElement = control.closest('[data-frmdb-record],[data-frmdb-bind-to-record]') as HTMLElement;
    if (!parentEl) {console.warn("Could not get parent of " + control.outerHTML); return null};
    let ret = parentEl.getAttribute('data-frmdb-record') || parentEl.getAttribute('data-frmdb-bind-to-record')?.replace(/^\$FRMDB\./, '');
    if (!ret) {console.warn("Could not get obj id of parent " + parentEl.outerHTML + " for " + control.outerHTML); return null};
    return ret;
}

export class FormService {
    
    constructor(private appRootEl: HTMLElement) {
        onEvent(appRootEl, ["change", "input"], "*", async (event) => {
            if (event.handled === true) return;
            else event.handled = true;

            if (!appRootEl.contains(event.target)) return;
            let inputEl = event.target;
            if (!isFormEl(inputEl)) return;
            if (!Object.keys(DATA_FRMDB_ATTRS_Enum).find(k => inputEl.getAttribute(k))) {return}

            this.applyClientSideFormulasOnForm(inputEl);
            let pObj = $FRMDB_RECORD(inputEl);
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

            let pObj = $FRMDB_RECORD(inputEl);
            if (!pObj) return;
            event.preventDefault();

            this.manageInput(inputEl as InputElem, true)
            .then(event => {
                if (event) {
                    if (event.state_ === "ABORT") {
                        let i18nErrMsg = event.error_ ? I18N.terr(event.error_) : I18N.tt('Internal Server Err');
                        raiseSingletonNotification('form', ThemeColors.danger, "", i18nErrMsg);
                    } else {
                        raiseSingletonNotification('form', ThemeColors.success, "", 'Changes Saved.');
                    }
                }
            });
        });        
        
    }
    
    private debounced_manageInput = _.debounce((inputEl: InputElem) => this.manageInput(inputEl), 350);
    private debounced_newRecordCache = _.debounce((inputEl: InputElem) => this.putObjInNewRecordCache(inputEl), 100);

    async manageInput(inputEl: InputElem, isSubmit?: boolean): Promise<ServerEventModifiedFormData|ServerEventPreComputeFormData|void> {
        let pObj = $FRMDB_RECORD(inputEl);
        if (!pObj) return;
        let {parentEl, parentObj} = pObj;
        if (null === parentObj) { console.info("Parent obj not found for " + inputEl); return; }

        let err = this.validateOnClient(parentEl, parentObj);
        if (err.length == 0) {
            removeSingletonNotification('form');
            for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                control.dataset.frmdbPending = "";//TODO: set this only on dirty controls
            }

            let event: ServerEventModifiedFormData | ServerEventPreComputeFormData;
            let userError: string | null = null;
            try {
                if (inputEl.closest('[data-frmdb-form-auto-save]') || isSubmit) {
                    event = await BACKEND_SERVICE().putEvent(
                        new ServerEventModifiedFormData(parentObj)) as ServerEventModifiedFormData;
                } else {
                    event = await BACKEND_SERVICE().putEvent(
                        new ServerEventPreComputeFormData(parentObj)) as ServerEventPreComputeFormData;

                }

                for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                    control.dataset.frmdbPending = undefined;
                }
                if (event.state_ === "ABORT") {
                    let i18nErrMsg = event.error_ ? I18N.terr(event.error_) : I18N.tt('Internal Server Err');
                    this.markInvalid(inputEl, i18nErrMsg);
                    raiseSingletonNotification('form', ThemeColors.danger, "", i18nErrMsg);
                    return;
                } else {
                    let entityId = entityNameFromDataObjId(event.obj._id);
                    let suffix = parentEl.hasAttribute('data-frmdb-bind-to-record') ? '{}' : '[]';
                    let fieldsToUpdate: any = {_id: event.obj._id};
                    for (let [key, val] of Object.entries(event.obj)) {
                        if (val != parentObj[key]) {
                            fieldsToUpdate[key] = val;
                        }
                    }
                    updateDOM({
                        [`$FRMDB.${entityId}${suffix}`]: fieldsToUpdate,
                    }, parentEl);
                    if (parentObj._id != event.obj._id) {
                        parentObj._id = event.obj._id;
                        parentEl.setAttribute('data-frmdb-record', _idAsStr(parentObj._id));
                    }
                    if (event.type_ === "ServerEventModifiedFormData") {
                        raiseSingletonNotification('form', ThemeColors.success, "", 'Changes Saved.', true);
                    }
                }
                return event;
            } catch (err) {
                userError = getUserError(err + '');
                let i18nErrMsg = userError ? I18N.terr(userError) : I18N.tt('Internal Server Error!');
                this.markInvalid(inputEl, i18nErrMsg);
                raiseSingletonNotification('form', ThemeColors.danger, "", i18nErrMsg);
                return;
            }

            // {
            //     let entityId = entityNameFromDataObjId(parentObj._id);
            //     let entity = BACKEND_SERVICE().getCurrentSchema()?.entities?.[entityId];
            //     if (!entity) {console.warn(entityId, "not found"); return}
            //     let references: {[aliasName: string]: {refs: ReferenceToProperty[], entityName: string}} = {};
            //     for (let prop of Object.values(entity.props)) {
            //         if (prop.propType_ === Pn.REFERENCE_TO) {
            //             let ref = references[prop.referencedEntityName];
            //             if (!ref) {
            //                 ref = {refs: [], entityName: prop.referencedEntityName};
            //                 references[prop.referencedEntityName] = ref;
            //             }
            //             ref.refs.push(prop);
            //         }
            //     }
            
            //     for (let [aliasName, refsForEntity] of Object.entries(references)) {   
            //         await this.updateDomForReference(aliasName, parentEl, parentObj);
            //     }
            // }
        } else {
            raiseSingletonNotification('form', ThemeColors.warning, "", I18N.terr(err));
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
        let pObj = $FRMDB_RECORD(el);
        if (!pObj?.parentObj) {console.warn("parent record not found for ", el); return;}
        await this.updateDomForReference(tableAlias, el, pObj?.parentObj);
    }

    private putObjInNewRecordCache(inputEl: InputElem) {
        let parentEl = $FRMDB_RECORD_EL(inputEl);
        if (!parentEl) return;
        let parentObjId = parentEl.getAttribute('data-frmdb-record');
        if (parentObjId && isNewDataObjId(parentObjId)) {
            let parentObj = serializeElemToObj(parentEl) as DataObj;

            localStorage.setItem(parentObjId, JSON.stringify({
                ...parentObj,
                _id: parentObjId,
                formNewRecordCacheTimestamp: new Date().getTime()
            }));
        }
    }

    private getObjFromNewRecordCache(objId: KeyValueObjIdType): {_id: string, formNewRecordCacheTimestamp: number} | null {
        let objStr = localStorage.getItem(_idAsStr(objId));
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

    private applyClientSideFormulasOnForm(control: HTMLElement) {
        if (control.closest('frmdb-component-editor')) return;
        let formEl: HTMLElement | null = control.closest('form');
        if (!formEl) return;
        let formObj = this.serializeForm(formEl);
        updateDOM(formObj, formEl);
        this.validateForm(formEl, formObj);
        formEl.classList.add('was-validated');
    }
    private serializeForm(el: HTMLElement) {
        let obj: {} = {};
        for (let inputEl of Array.from(el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`input,select,textarea`))) {
            if (inputEl.name) {
                obj[inputEl.name] = inputEl.value;
            }
        }
        return obj;
    }
    private validateForm(el: HTMLElement, formObj: {}) {
        for (let inputEl of Array.from(el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`input,select,textarea`))) {
            if (inputEl.hasAttribute('data-frmdb-validation')) {
                let validationExpr = inputEl.getAttribute('data-frmdb-validation')!;
                let isValid = true;
                try {
                    isValid = scalarFormulaEvaluate(formObj, validationExpr);
                } catch (err) {
                    console.warn('Error during client side vaidation', inputEl.outerHTML, formObj);
                }
                if (!isValid) this.markInvalid(inputEl, inputEl.getAttribute('data-frmdb-validation-msg') || `failed check ${validationExpr}`);
                else this.markValid(inputEl);
            }
        }
    }


    private markInvalid(el: InputElem, err: string) {
        el.setCustomValidity(err);
        if (el.title && !el.hasAttribute('data-frmdb-validation-title-bak')) {
            el.setAttribute('data-frmdb-validation-title-bak', el.title);
        }
        el.title = "Invalid: " + err + '   (frmdbv)';
    }

    private markValid(el: InputElem) {
        el.setCustomValidity("");
        if (el.title?.indexOf("(frmdbv)") >= 0) {
            if (el.hasAttribute('data-frmdb-validation-title-bak')) {
                el.title = el.getAttribute('data-frmdb-validation-title-bak')!
            } else el.removeAttribute('title');
        }
    }

    public validateOnClient(parentEl: HTMLElement, parentObj: DataObj): FailedValidation[] {
        try {
            const tools = BACKEND_SERVICE().getFrmdbEngineTools();
            
            let formEl: HTMLElement | null = parentEl;
            if (formEl.tagName !== 'FORM') formEl = parentEl.querySelector('form');
            if (formEl) {
                formEl.classList.add('was-validated');
            }

            let entityId = entityNameFromDataObjId(parentObj._id);
            let entity = tools.schemaDAO.schema.entities[entityId];
            for (let control of getAllElemsWithDataBindingAttrs(parentEl)) {
                if (!isFormEl(control)) { console.log("Only form elements are sent to the server ", control.outerHTML); continue };
                let propertyName = getEntityPropertyNameFromEl(control).replace(new RegExp(`^\\$FRMDB\\.${entityId}(\\[\\]|\\{\\})\\.`), '');
                let err = validateAndCovertObjPropertyType(parentObj, entity, propertyName, control.value, tools.schemaDAO.schema);
                if (err.length > 0) { this.markInvalid(control, I18N.terr(err)); return err;}
                else this.markValid(control);

                if (!control.validity.valid) {
                    return [{
                        tableName: entityId,
                        obj: parentObj,
                        invalidColName: propertyName,
                        errorMessage: "Invalid Input",
                    }];
                }
                
                //call only on server side fow now...
                // err = tools.validateObj(parentObj);
                // if (err.length > 0) { control.setCustomValidity(I18N.terr(err)); return err;}
            }

            return [];
        } catch (err) {
            console.error(err);
            return [{
                tableName: entityNameFromDataObjId(parentObj._id),
                obj: parentObj,
                errorMessage: `Internal Error validating ${parentObj._id}: ${err}`,
            }];
        }
    }
}

export const FORM_SERVICE: {instance: FormService | null} = {
    instance: null
};
