import { findElem, getElem, setElem, Elem, createElem, isList, getElemList, createElemList, setElemValue } from "./dom-node";

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

export function renderChild(newData: {}, path: string, el: Elem) {
    let targetEl = findElem(el, path);
    if (!targetEl) return;
    return render(newData, targetEl);
}

export function render(newData: {}, el: Elem) {

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
            let elemListForKey = getElemList(el, key);
            if (null == elemListForKey) {
                elemListForKey = createElemList('div', key, objValForKey.length);
                elemListForKey.addTo(el);
            }

            for (let [i, o] of objValForKey.entries()) {
                if (elemListForKey.length <= i) {
                    elemListForKey.addElem();
                }
                render(o, elemListForKey.at(i)!);
            };
            for (let i = objValForKey.length; i < elemListForKey.length; i++) {
                elemListForKey.removeAt(i);
            }

        } else if (/string|boolean|number/.test(typeof objValForKey) || objValForKey instanceof Date) {
            let elemForKey = getElem(el, key);
            if (null == elemForKey) {
                elemForKey = createElem('div', key);
                setElem(el, key, elemForKey);
            }

            setElemValue(elemForKey, key, objValForKey);
        } else if ('object' === typeof objValForKey) {
            let elemForKey = getElem(el, key);
            if (null == elemForKey) {
                elemForKey = createElem('div', key);
                setElem(el, key, elemForKey);
            }

            render(objValForKey, elemForKey);
        } else {
            throw new Error('unkown objValForKey type: \'' + objValForKey + '\'');
        }
    }
}
