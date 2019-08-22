import { getElemForKey, Elem, getElemList, setElemValue, getElemWithComplexPropertyDataBinding, getAllElemsWithDataBindingAttrs } from "./dom-node";
import { FrmdbLogger } from "@domain/frmdb-logger";
import { instance } from "gaxios";
const LOG = new FrmdbLogger('live-dom-template');

export function moveElem(el: Elem, $newParent: Elem, position: number) {
    throw new Error("TBD");
}

export function changeElem(el: Elem, $newElem: Elem) {
    throw new Error("TBD");
}

export function addElem(el: Elem, $parent: Elem, position: number) {
    throw new Error("TBD");
}

export function cloneElem(el: Elem) {
    throw new Error("TBD");
}

export function deleteElem(el: Elem) {
    throw new Error("TBD");
}

/**
 * Vision:
 * - The HTML itself is the template, data attributes define the data mapping
 * - Properties are DOM (no part of HTML) so dynamic data should use data-frmdb-prop (e.g. object id of an object represented by a form)
 * - Attributes are part of HTML so each modification to an attribute means modifications to the template, data-frmdb-attr should be used only when properties cannot be used (e.g. classes, styles)
 * 
 * Nested variable scopes will not require 2 passes: 
 * - IF arrays are instantiated first, then all the instances will be bound with the valued from the parent scope
 * - IF the parent scope is bound first, it will modify the DOM and when arrays clone the first element the clones will inherit the correct values
 *
 * TODO: micro-benchmarks and perhaps find a more performing solution (e.g. diff with the previous version of the object and update the DOM with only the differences)
 * 
 * <div data-frmdb-table="tableName">
 *     <span data-frmdb-value=":::tableName[].field"></span>
 *     <span data-frmdb-value=":::topLevelObj.someField"></span>
 * </div>
 * 
 * Meta-value(s) and meta-attr(s) are like bash's ${!VAR}
 * LIMITATION: meta-values cannot use an array key from a different scope because the data binding will be evaluated outside the array and the current indexes will be unknown
 * 
 * @param newData 
 * @param el 
 */
export function updateDOM(newData: {}, el: Elem): void {
    updateDOMForScope(newData, el, newData, '', []);
}

function updateDOMForScope(newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[]) {
    let domKeySep = currentScopePrefix ? '.' : '';

    for (const key of Object.getOwnPropertyNames(newData)) {
        const objValForKey = newData[key];

        if (null == objValForKey) {
            continue;
        }

        updateDOMForKey(domKeySep, key, objValForKey, newData, el, context, currentScopePrefix, arrayCurrentIndexes);
    }
}

function updateDOMForKey(domKeySep: string, key: string, objValForKey: any, newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[]) {

    if (typeof objValForKey === "function") {
        objValForKey = objValForKey.call();
        if (objValForKey instanceof Promise) {
            objValForKey.then(val => 
                updateDOMForKey(domKeySep, key, val, newData, el, context, currentScopePrefix, arrayCurrentIndexes));
            return;
        }
    }

    if (objValForKey instanceof Array || 'object' === typeof objValForKey) {
        let complexPropDomKey = `${currentScopePrefix}${domKeySep}${key}`;
        let complexPropElems = getElemWithComplexPropertyDataBinding(el, complexPropDomKey);
        setElemValue(objValForKey, complexPropElems, complexPropDomKey, context, arrayCurrentIndexes);
    }

    if (objValForKey instanceof Array) {
        let domKey = `${currentScopePrefix}${domKeySep}${key}[]`;
        let elemListsForKey = getElemList(el, domKey);
        LOG.debug("updateDOMForScope", "", key, objValForKey, domKey,elemListsForKey);
        if (0 == elemListsForKey.length) return;

        for (let elemListForKey of elemListsForKey) {
            for (let [i, o] of objValForKey.entries()) {
                if (elemListForKey.length() <= i) {
                    elemListForKey.addElem();
                }
                elemListForKey.at(i)!['data-frmdb-obj'] = o;
                if (isScalar(o)) {
                    updateDOMForScalarValue(o, elemListForKey.at(i)!, context, domKey, arrayCurrentIndexes.concat(i), '', '');
                } else updateDOMForScope(o, elemListForKey.at(i)!, context, domKey, arrayCurrentIndexes.concat(i));
            };
            while (elemListForKey.length() > objValForKey.length) {
                elemListForKey.removeAt(objValForKey.length);
            }
        }
    } else if (isScalar(objValForKey)) {
        updateDOMForScalarValue(objValForKey, el, context, currentScopePrefix, arrayCurrentIndexes, domKeySep, key);
    } else if ('object' === typeof objValForKey) {
        let domKey = `${currentScopePrefix}${domKeySep}${key}`;
        let elemsForKey = getElemForKey(el, domKey);
        LOG.debug("updateDOMForScope", "", key, objValForKey, domKey, elemsForKey);
        if (0 == elemsForKey.length) {
            elemsForKey.push(el);
        }
        for (let elForKey of elemsForKey) {
            elForKey['data-frmdb-obj'] = objValForKey;
            updateDOMForScope(objValForKey, elForKey, context, domKey, arrayCurrentIndexes);
        }
    } else {
        throw new Error('unknown objValForKey type: \'' + objValForKey + '\'');
    }

}

function isScalar(objValForKey) {
    return /string|boolean|number/.test(typeof objValForKey) || objValForKey instanceof Date;
}

function updateDOMForScalarValue(objValForKey: string|boolean|number|Date, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[], domKeySep: string, key: string) {
    let domKey = `${currentScopePrefix}${domKeySep}${key}`;
    let elemsForKey = getElemForKey(el, domKey);
    LOG.debug("updateDOMForScope", "", key, objValForKey, domKey, elemsForKey);
    if (0 == elemsForKey.length) {
    } else {
        setElemValue(objValForKey, elemsForKey, domKey, context, arrayCurrentIndexes);
    }
}

export { getAllElemsWithDataBindingAttrs } from './dom-node';

export function serializeElemToObj(rootEl: HTMLElement): {} {
    let ret: any = {};
    let prefix = rootEl.getAttribute('data-frmdb-table') || '';
    for(let elem of getAllElemsWithDataBindingAttrs(rootEl)) {
        for (let i = 0; i < elem.attributes.length; i++) {
            let attr = elem.attributes[i];
            let value: string | number | boolean | null = null;
            if ('data-frmdb-value' === attr.name) {
                if (elem.tagName === "INPUT") {
                    let input: HTMLInputElement = elem as HTMLInputElement;
                    if (input.type == "number") value = parseInt(input.value);
                    else if (input.type == "checkbox") value = input.checked;
                    else value = input.value;
                } else value = elem.textContent;
            } else continue;//TODO: classes/styles/attributes/properties
            
            if (value != null) {
                let jsonKey = attr.value.replace(/.*:/, '');
                if (jsonKey.indexOf(prefix ? prefix + '.' : '') != 0) throw new Error("prefix not correct for key " + jsonKey + " attr " + attr.name + "=" + attr.value);
                jsonKey = jsonKey.slice(prefix ? prefix.length + 1 : 0);
                if (jsonKey.indexOf('[]') >= 0) continue;
                ret[jsonKey] = value;
            }
        }
    }

    return ret;
}

export function getEntityPropertyNameFromEl(el: InputElem): string {
    return (el.getAttribute('data-frmdb-value') || '').replace(/.*:/, '');
}

export type InputElem = 
 | HTMLInputElement
 | HTMLSelectElement
 | HTMLTextAreaElement
;
export function isFormEl(el: Element): el is InputElem {
    return el instanceof HTMLInputElement
        || el instanceof HTMLSelectElement
        || el instanceof HTMLTextAreaElement
    ;
}
