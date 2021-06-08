import { getElemForKey, Elem, getElemList, setElemValue, getElemWithComplexPropertyDataBinding, getAllElemsWithDataBindingAttrs, elemHasDataBindingForKey, getElemValue } from "./dom-node";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOG = new FrmdbLogger('live-dom-template');

declare var Element: null, HTMLElement: null, Window: null, Document: null, Event: null, CustomEvent: null;

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
export function updateDOMForDoc(currentDoc: Document, newData: {}, el: Elem, context?: {}): void {
    updateDOMForScope(currentDoc, newData, el, {...newData, ...context}, '', []);
}

function updateDOMForScope(currentDoc: Document, newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[]) {
    let domKeySep = currentScopePrefix ? '.' : '';

    for (const key of Object.getOwnPropertyNames(newData)) {
        const objValForKey = newData[key];

        if (null == objValForKey) {
            continue;
        }

        updateDOMForKey(currentDoc, domKeySep, key, objValForKey, newData, el, context, currentScopePrefix, arrayCurrentIndexes);
    }
}

function updateDOMForKey(currentDoc: Document, domKeySep: string, key: string, objValForKey: any, newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[]) {

    if (typeof objValForKey === "function") {
        objValForKey = objValForKey.call();
        if (objValForKey instanceof Promise) {
            objValForKey.then(val => 
                updateDOMForKey(currentDoc, domKeySep, key, val, newData, el, context, currentScopePrefix, arrayCurrentIndexes));
            return;
        }
    }

    if (objValForKey instanceof Array || 'object' === typeof objValForKey) {
        let complexPropDomKey = `${currentScopePrefix}${domKeySep}${key}`;
        let complexPropElems = getElemWithComplexPropertyDataBinding(el, complexPropDomKey);
        setElemValue(objValForKey, complexPropElems, complexPropDomKey, context, arrayCurrentIndexes, key);
    }

    if (objValForKey instanceof Array) {
        let domKey = `${currentScopePrefix}${domKeySep}${key}[]`;
        let elemListsForKey = getElemList(el, domKey);
        LOG.debug("updateDOMForKeyArray", "", key, objValForKey, domKey, elemListsForKey);
        if (0 == elemListsForKey.length) return;

        for (let elemListForKey of elemListsForKey) {
            let elemListToDataBind: Elem[];
            {
                let elemListBeforeRemovalOfExtraElems = elemListForKey.elems();
                let nbElementsToRemainInDom = Math.max(1, objValForKey.length);
                //one DOM element must remain in order to define the data binding (if you want to hide elements use data-frmdb-if)
                for (let i = 0; i < elemListBeforeRemovalOfExtraElems.length - nbElementsToRemainInDom; i++ ) {
                    let elToRemove = elemListForKey.lastElem();
                    if (!elToRemove) {console.error(`Element at index ${i} not found`); break;}
                    let ev = currentDoc.createEvent('CustomEvent');
                    ev.initCustomEvent("FrmdbRemovePageElement", true, true, {type: "FrmdbRemovePageElement", el: elToRemove});
                    currentDoc.dispatchEvent(ev);
                    elemListForKey.remove(elToRemove);
                }
                elemListToDataBind = elemListForKey.elems();
            }

            let newElemsAdded: Elem[] = [];
            {
                let elemListBeforeAddingNewElems = elemListForKey.elems();
                if (elemListForKey.elems().length < objValForKey.length) {
                    newElemsAdded = elemListForKey.createElems(objValForKey.length - elemListBeforeAddingNewElems.length);
                }
                elemListToDataBind = elemListToDataBind.concat(newElemsAdded);
            }

            for (let [i, o] of objValForKey.entries()) {
                elemListToDataBind[i]!['$DATA-FRMDB-OBJ$'] = o;
                if (o._id && o._id.indexOf('~~') > 0) {
                    elemListToDataBind[i]!.setAttribute('data-frmdb-record', o._id);
                }
                if (isScalar(o)) {
                    updateDOMForScalarValue(o, elemListToDataBind[i]!, context, domKey, arrayCurrentIndexes.concat(i), '', '');
                } else {
                    let elemsForKey = getElemForKey(elemListToDataBind[i]!, domKey);
                    setElemValue(o, elemsForKey, domKey, context, arrayCurrentIndexes, key);
                }
                updateDOMForScope(currentDoc, o, elemListToDataBind[i]!, context, domKey, arrayCurrentIndexes.concat(i));
            };

            elemListForKey.addAll(newElemsAdded);
            for (let newElemInList of newElemsAdded) {
                let ev = currentDoc.createEvent('CustomEvent');
                ev.initCustomEvent("FrmdbAddPageElement", false, true, {type: "FrmdbAddPageElement", el: newElemInList});
                currentDoc.dispatchEvent(ev);
            }
        }
    } else if (isScalar(objValForKey)) {
        updateDOMForScalarValue(objValForKey, el, context, currentScopePrefix, arrayCurrentIndexes, domKeySep, key);
    } else if ('object' === typeof objValForKey) {
        let domKey = `${currentScopePrefix}${domKeySep}${key}`;
        let elemsForKey = getElemForKey(el, domKey);
        LOG.debug("updateDOMForKeyObj", "", key, objValForKey, domKey, elemsForKey);
        if (0 == elemsForKey.length) {
            elemsForKey.push(el);
        } else {
            setElemValue(objValForKey, elemsForKey, `${currentScopePrefix}${domKeySep}${key}`, context, arrayCurrentIndexes, key);
        }
        for (let elForKey of elemsForKey) {
            elForKey['$DATA-FRMDB-OBJ$'] = objValForKey;
            let scopeEl = elForKey;
            if (key.slice(-2) === '{}') scopeEl = el;
            updateDOMForScope(currentDoc, objValForKey, scopeEl, context, domKey, arrayCurrentIndexes);
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
    LOG.debug("updateDOMForScalarValue", "", key, objValForKey, domKey, elemsForKey);
    if (0 == elemsForKey.length) {
    } else {
        setElemValue(objValForKey, elemsForKey, domKey, context, arrayCurrentIndexes, key);
    }
}
