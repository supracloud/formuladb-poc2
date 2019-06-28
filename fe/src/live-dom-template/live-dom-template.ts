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
 * Nested variable scopes will require 2 passes: 
 *  - first pass will ensure all array elements are instantiated
 *  - second pass will ensure all new array elements are updated with values from the upper scopes
 * TODO: micro-benchmarks and perhaps find a more performing solution (e.g. stop diffing with the DOM and diff with the previous version of the object)
 * 
 * <div data-frmdb-foreach="tableName">
 *     <span data-frmdb-value="tableName[].field"></span>
 *     <span data-frmdb-value="topLevelObj.someField"></span>
 * </div>
 * 
 * @param newData 
 * @param el 
 */
export function updateDOM(newData: {}, el: Elem): void {
    _updateDOM(newData, el, newData, '', []);
    _updateDOM(newData, el, newData, '', []);
}

function _updateDOM(newData: {}, el: Elem, context: {}, currentScopePrefix: string, arrayIndexes: number[]) {
    let domKeySep = currentScopePrefix ? '.' : '';

    for (const key in newData) {
        if ('type_' === key) { continue; }
        // if ('_rev' === key) continue;
        // if ('_id' === key) continue;

        const objValForKey = newData[key];
        if (null === objValForKey) {
            continue;
            //FIXME: here we have to delete elems...but we have to take care of the template
        }

        if (objValForKey instanceof Array) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}[]`;
            let elemListForKey = getElemList(el, domKey);
            if (null == elemListForKey) continue;

            for (let [i, o] of objValForKey.entries()) {
                if (elemListForKey.length <= i) {
                    elemListForKey.addElem();
                }
                _updateDOM(o, elemListForKey.at(i)!, context, domKey, arrayIndexes.concat(i));
            };
            for (let i = objValForKey.length; i < elemListForKey.length; i++) {
                elemListForKey.removeAt(i);
            }

        } else if (/string|boolean|number/.test(typeof objValForKey) || objValForKey instanceof Date) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}`;
            let elemsForKey = getElem(el, domKey);
            if (0 == elemsForKey.length) {
                //create missing elements only for Arrays
                // elemForKey = createElem('div', key);
                // setElem(el, key, elemForKey);
            } else {
                setElemValue(elemsForKey, domKey, context, arrayIndexes);
            }
        } else if ('object' === typeof objValForKey) {
            let domKey = `${currentScopePrefix}${domKeySep}${key}`;
            let elemsForKey = getElem(el, domKey);
            if (0 == elemsForKey.length) {
                //create missing elements only for Arrays
                // elemForKey = createElem('div', key);
                // setElem(el, key, elemForKey);
            } else {
                for (let elForKey of elemsForKey) {
                    _updateDOM(objValForKey, elForKey, context, domKey, arrayIndexes);
                }
            }
        } else {
            throw new Error('unknown objValForKey type: \'' + objValForKey + '\'');
        }
    }
}
