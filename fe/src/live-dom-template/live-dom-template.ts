import { getElem, Elem, getElemList, setElemValue } from "./dom-node";

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
 * <div data-frmdb-foreach="tableName">
 *     <span data-frmdb-value="tableName[].field"></span>
 *     <span data-frmdb-value="topLevelObj.someField"></span>
 * </div>
 * 
 * Meta-value(s) and meta-attr(s) are like bash's ${!VAR}
 * LIMITATION: meta-values cannot use an array key from a different scope because the data binding will be evaluated outside the array and the current indexes will be unknown
 * 
 * @param newData 
 * @param el 
 */
export function updateDOM(newData: {}, el: Elem): void {
    _updateDOM(newData, el, newData, '', []);
    // _updateDOM(newData, el, newData, '', []);
}

function _updateDOM(newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayCurrentIndexes: number[]) {
    let domKeySep = currentScopePrefix ? '.' : '';

    for (const key in newData) {

        const objValForKey = newData[key];
        if (null == objValForKey) {
            continue;
        }

        if (objValForKey instanceof Array) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}[]`;
            let elemListForKey = getElemList(el, domKey);
            if (null == elemListForKey) continue;

            for (let [i, o] of objValForKey.entries()) {
                if (elemListForKey.length <= i) {
                    elemListForKey.addElem();
                }
                _updateDOM(o, elemListForKey.at(i)!, context, domKey, arrayCurrentIndexes.concat(i));
            };
            for (let i = objValForKey.length; i < elemListForKey.length; i++) {
                elemListForKey.removeAt(i);
            }

        } else if (/string|boolean|number/.test(typeof objValForKey) || objValForKey instanceof Date) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}`;
            let elemsForKey = getElem(el, domKey);
            if (0 == elemsForKey.length) {
            } else {
                setElemValue(elemsForKey, domKey, context, arrayCurrentIndexes);
            }
        } else if ('object' === typeof objValForKey) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}`;
            let elemsForKey = getElem(el, domKey);
            if (0 == elemsForKey.length) {
                elemsForKey.push(el);
            }
            for (let elForKey of elemsForKey) {
                _updateDOM(objValForKey, elForKey, context, domKey, arrayCurrentIndexes);
            }
        } else {
            throw new Error('unknown objValForKey type: \'' + objValForKey + '\'');
        }
    }
}
