import * as isNode from 'detect-node';
import * as _ from "lodash";//TODO: optimization include only the needed functions

let parser, serializer;
// console.error(isNode);
if (isNode) {
    require('jsdom-global')();
    parser = new (window as any).DOMParser();
    serializer = new (window as any).XMLSerializer();
} else {
    parser = new DOMParser();
    serializer = new XMLSerializer();
}
export type Elem = HTMLElement;
export class ElemList {
    constructor(private key: string, private parentEl: Elem) {}

    get length() {
        return this.parentEl.querySelectorAll(`[data-frmdb-foreach="${this.key}"]`).length;
    }

    public addElem() {
        let firstEl = this.parentEl.querySelector(`[data-frmdb-foreach="${this.key}"]`);
        if (!firstEl) firstEl = createElem('div', this.key);
        this.parentEl.appendChild(firstEl.cloneNode(true));
    }

    public addTo(parentEl: Elem) {
        parentEl.appendChild(this.parentEl);
    }

    public at(idx: number): Elem | null{
        let list = this.parentEl.querySelectorAll(`[data-frmdb-foreach="${this.key}"]`);
        if (list.length < idx) return null;
        else return list[idx] as Elem;
    }

    public removeAt(idx: number) {
        let childEl = this.parentEl.childNodes[idx];
        if (!childEl) return;
        this.parentEl.removeChild(childEl);
    }
}

export function parseHTML(html: string): Elem {
    return parser.parseFromString(html, "text/html").body;
}
export function writeHTML(el: Elem): string {
    return serializer.serializeToString(el);
}

export function createElem(tagName: string, key: string): Elem {
    let el = document.createElement(tagName);
    let attr = document.createAttribute("data-frmdb-value");
    attr.value = key;
    el.setAttributeNode(attr);
    
    return el;
}

export function createElemList(tagName: string, key: string, length: number): ElemList {
    let dummy = document.createElement('div');
    for (let i = 0; i < length; i++) {
        let el = document.createElement(tagName);
        let attr = document.createAttribute("data-frmdb-foreach");
        attr.value = key;
        el.setAttributeNode(attr);
        dummy.appendChild(el);
    }
    return new ElemList(key, dummy);
}

export function getElem(el: Elem, key: string): Elem[] {
    return Array.from(el.querySelectorAll(
        `[data-frmdb-value="${key}"],[data-frmdb-attr$=":${key}"],[data-frmdb-attr2$=":${key}"],[data-frmdb-attr3$=":${key}"],[data-frmdb-attr4$=":${key}"],[data-frmdb-meta-value$="${key}"],[data-frmdb-meta-attr$=":${key}"],[data-frmdb-meta-attr2$=":${key}"],[data-frmdb-meta-attr3$=":${key}"],[data-frmdb-meta-attr4$=":${key}"]`
    ));
}

export function getElemList(el: Elem, key: string): ElemList | null {
    let firstEl = el.querySelector(`[data-frmdb-foreach="${key}"]`);
    if (!firstEl) return null;
    if (!firstEl.parentElement) throw new Error("Elem " + firstEl + " has no parent !?!?");
    return new ElemList(key, firstEl.parentElement);
}

export function addElem(el: Elem, childEl: Elem) {
    el.appendChild(childEl);
}


function getValueForDomKey(domKey: string, context: {}, arrayCurrentIndexes: number[]) {
    let arrayIdx = 0;
    return _.get(context,
        domKey.split(/(\[\])/).map(x => x == '[]' ? `[${arrayCurrentIndexes[arrayIdx++]}]` : x).join('')
    );
}

export function setElemValue(elems: Elem[], key: string, context: {}, arrayCurrentIndexes: number[]) {
    for (let el of elems) {
        let foundDataBinding = _setElemValue(el, key, context, arrayCurrentIndexes, "")
            || _setElemValue(el, key, context, arrayCurrentIndexes, "-meta")
        if (!foundDataBinding) throw new Error("El " + el + " does not have data binding for key " + key);
    }
}

function _setElemValue(el: Elem, key: string, context: {}, arrayCurrentIndexes: number[], meta: "-meta" | ""): boolean {

    let dataAttrs: string[] = [
        el.getAttribute(`data-frmdb${meta}-attr`), 
        el.getAttribute(`data-frmdb${meta}-attr2`), 
        el.getAttribute(`data-frmdb${meta}-attr3`), 
        el.getAttribute(`data-frmdb${meta}-attr4`)
    ].filter(x => null != x && x.indexOf(':' + key) > 0) as string[];

    if (dataAttrs.length > 0) {
        for (let dataAttr of dataAttrs) {
            let arr = dataAttr.split(":");
            let attrName = arr[0];
            let value;
            if ("" === meta) {
                if (arr.length != 2 || arr[1] != key) throw new Error("Expected attrName:domKey but found " + dataAttr + " for key " + key);
                value = getValueForDomKey(key, context, arrayCurrentIndexes);
            } else {
                if (arr.length != 3 || arr[2] != key) throw new Error("Expected attrName:metaObjKey:domKey but found " + dataAttr + " for key " + key);
                let metaCtx = getValueForDomKey(arr[1], context, arrayCurrentIndexes);
                let metaKey = getValueForDomKey(key, context, arrayCurrentIndexes);
                value = getValueForDomKey(metaKey, metaCtx, arrayCurrentIndexes);
            }
            dataAttr.replace(/:.*$/, '');
            if (attrName.indexOf("class.") == 0) {
                let className = attrName.replace(/^class\./, '');
                el.classList.toggle(className, value == true );
            } else if (attrName.indexOf("style.") == 0) {
                let styleName = attrName.replace(/^style\./, '');
                el.style.setProperty(styleName, value + '');
            } else {
                el.setAttribute(attrName, value + '');
            }
        }
        return true;
    } else {
        let valueAttr = el.getAttribute(`data-frmdb${meta}-value`)||'';
        if (valueAttr.replace(/^.*:/, '') == key) {
            let value;
            if ("" == meta) {
                value = getValueForDomKey(key, context, arrayCurrentIndexes);
            } else {
                let [metaCtxKey, domKey] = valueAttr.split(":");
                if (!metaCtxKey || domKey != key) throw new Error("Expected metaObjKey:domKey but found " + valueAttr + " for key " + key);
                let metaCtx = getValueForDomKey(metaCtxKey, context, arrayCurrentIndexes);
                let metaKey = getValueForDomKey(key, context, arrayCurrentIndexes);
                value = getValueForDomKey(metaKey, metaCtx, arrayCurrentIndexes);
            }

            if ((el as HTMLElement).tagName.toLowerCase() === 'input') {
                (el as HTMLInputElement).value = value + '';
            } else {
                let textNodeFound: boolean = false;
                el.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        child.nodeValue = value + '';
                        textNodeFound = true;
                    }
                })
                if (!textNodeFound) {
                    let textNode = document.createTextNode(value + '');
                    el.appendChild(textNode);
                }
            }
            return true;
        } else return false;
    }
}

export function isList(el: Elem): boolean {
    let attr = el.getAttribute('data-frmdb-foreach');
    if (!attr) return false;
    else return true;
}

export function deleteElem(el: Elem, childEl: Elem) {
    el.removeChild(childEl);
}
