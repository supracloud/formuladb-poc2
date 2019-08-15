import * as _ from "lodash";//TODO: optimization include only the needed functions
import * as DOMPurify from "dompurify";

let parser = new DOMParser(), serializer = new XMLSerializer();

export type Elem = HTMLElement;
export class ElemList {
    constructor(private key: string, private parentEl: Elem) {}

    public length() {
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

enum DATA_FRMDB_ATTRS_Enum {
    'data-frmdb-value' = 'data-frmdb-value',
    'data-frmdb-attr' = 'data-frmdb-attr',
    'data-frmdb-attr2' = 'data-frmdb-attr2',
    'data-frmdb-attr3' = 'data-frmdb-attr3',
    'data-frmdb-attr4' = 'data-frmdb-attr4',
    'data-frmdb-prop' = 'data-frmdb-prop',
    'data-frmdb-prop2' = 'data-frmdb-prop2',
    'data-frmdb-prop3' = 'data-frmdb-prop3',
    'data-frmdb-prop4' = 'data-frmdb-prop4',
    'data-frmdb-if' = 'data-frmdb-if',
};
export function getElemForKey(el: Elem, key: string): Elem[] {
    let sel = Object.keys(DATA_FRMDB_ATTRS_Enum).map(a => `[${a}$=":${key}"]`).join(',');
    return _getElemForKey(el, sel);
}
export function getAllElemsWithDataBindingAttrs(el: Elem): Elem[] {
    let ret: Elem[] = [];
    let sel = Object.keys(DATA_FRMDB_ATTRS_Enum).map(a => `[${a}]`).join(',');
    if (el.matches(sel)) ret.push(el);
    return ret.concat(Array.from(el.querySelectorAll(sel)));
}

export function getElemWithComplexPropertyDataBinding(el: Elem, key: string): Elem[] {
    let sel = [
        DATA_FRMDB_ATTRS_Enum["data-frmdb-prop"],
        DATA_FRMDB_ATTRS_Enum["data-frmdb-prop2"],
        DATA_FRMDB_ATTRS_Enum["data-frmdb-prop3"],
        DATA_FRMDB_ATTRS_Enum["data-frmdb-prop4"],
        ].map(a => `[${a}$=":${key}"]`).join(',');
    return _getElemForKey(el, sel);
}
function _getElemForKey(el: Elem, sel: string): Elem[] {
    let ret: Elem[] = [];
    if (el.matches /* ShadowRoot does not have matches method */ && el.matches(sel)) ret.push(el);
    return ret
        .concat(Array.from(el.querySelectorAll(sel)))
        .concat(_.flatMap(el.querySelectorAll('template'), 
            tmpl => Array.from(tmpl.content.querySelectorAll(sel))));
}

export function getElemList(el: Elem, key: string): ElemList[] {
    let listElems = Array.from(el.querySelectorAll(`[data-frmdb-foreach="${key}"]`));
    let parents: Set<HTMLElement> = new Set();
    for (let listEl of listElems) {
        if (!listEl.parentElement) throw {err: new Error("found data-frmdb-foreach without parent"), key, listEl};
        parents.add(listEl.parentElement);
    }
    return Array.from(parents.values()).map(parent => new ElemList(key, parent));
}

export function addElem(el: Elem, childEl: Elem) {
    el.appendChild(childEl);
}

/**
 * 
 * @param domKey key template, e.g. table[].childTable[].x
 * @param arrayCurrentIndexes current indexes inside tables
 * @returns expanded key, e.g. table[2].childTable[5].x
 */
function domExpandedKey(domKey: string, arrayCurrentIndexes: number[]) {
    let arrayIdx = 0;
    return domKey.split(/(\[\])/).map(x => x == '[]' ? `[${arrayCurrentIndexes[arrayIdx++]}]` : x).join('');
}

function getValueForDomKey(domKey: string, context: {}, arrayCurrentIndexes: number[]) {
    return _.get(context, domExpandedKey(domKey, arrayCurrentIndexes));
}

/**
 * 
 * @param domExpandedKey expanded key e.g. table[2].childTable[5].x
 * @param context POJO
 * @returns deep value from object as defined by key
 */
export function getValueForDomExpandedKey(domExpandedKey: string, context: {}) {
    return _.get(context, domExpandedKey);
}

export function setElemValue(elems: Elem[], key: string, context: {}, arrayCurrentIndexes: number[]) {
    for (let el of elems) {
        let foundDataBinding = _setElemValue(el, key, context, arrayCurrentIndexes)
        if (!foundDataBinding) throw new Error("Internal Error: " + el + " does not have data binding for key " + key);
    }
}

interface DataAttr {
    attrName: string;
    attrValue: string;
    valueName: string;
    metaKey: string;
    ctxKey: string;
    value: any;
}
class ElemDataAttrs {
    if?: DataAttr;
    value?: DataAttr;
    attr: DataAttr[] = [];
    prop: DataAttr[] = [];
}
function getDataBindingAttrs(el: Elem, key: string, context: {}, arrayCurrentIndexes: number[]): ElemDataAttrs {
    let ret: ElemDataAttrs = new ElemDataAttrs();
    for (let i = 0; i < el.attributes.length; i++) {
        let attrib = el.attributes[i];
        if (attrib.value && attrib.name.indexOf('data-frmdb') == 0 && attrib.value.endsWith(':' + key)) {
            let [valueName, metaKey, ctxKey] = attrib.value.split(":");
            if (ctxKey != key) throw new Error("Expected if [valueName]:[metaObjKey]:domKey but found " + attrib.name + "=" + attrib.value + " for key " + key);
            
            let value, metaKeyExpanded = '', ctxKeyExpanded = domExpandedKey(ctxKey, arrayCurrentIndexes);
            if (metaKey === '') {
                value = getValueForDomExpandedKey(ctxKeyExpanded, context) || '';
            } else {
                metaKeyExpanded = domExpandedKey(metaKey, arrayCurrentIndexes);
                let metaCtx = getValueForDomExpandedKey(metaKeyExpanded, context);
                let keyForSearchingInMetaContext = getValueForDomExpandedKey(ctxKeyExpanded, context);
                value = getValueForDomKey(keyForSearchingInMetaContext, metaCtx, arrayCurrentIndexes) || '';
            }

            let type = attrib.name.replace(/^data-frmdb-/, '').replace(/\d$/, '');
            let dataAttr: DataAttr = { attrName: attrib.name, attrValue: attrib.value, valueName, metaKey, ctxKey, value };
            if ("if" === type) ret.if = dataAttr;
            else if ("value" === type) ret.value = dataAttr;
            else if ("attr" === type) ret.attr.push(dataAttr);
            else if ("prop" === type) ret.prop.push(dataAttr);
            else throw new Error("Unknown type " + type + "for " + attrib.name + " " + attrib.value + " " + key);
            
            el[attrib.name] = `${valueName}:${metaKeyExpanded}:${ctxKeyExpanded}`;//save expanded keys for debugging purposes
        }
    }
    return ret;
}

function _setElemValue(el: Elem, key: string, context: {}, arrayCurrentIndexes: number[]): boolean {
    let ret = false;
    let dataAttrsForEl = getDataBindingAttrs(el, key, context, arrayCurrentIndexes);

    if (dataAttrsForEl.if) {
        let value = dataAttrsForEl.if.value;
        if ('!' === dataAttrsForEl.if.valueName) value = !value;

        if (isHidden(el)) {
            if (true === value) {
                show(el);
            } else return true;//no checking for further data binding for hidden element
        } else {
            if (false == value) {
                hide(el, dataAttrsForEl.if);
            }
        }
        ret = true;
    }

    if (dataAttrsForEl.attr.length > 0) {
        for (let dataAttr of dataAttrsForEl.attr) {
            let value = dataAttr.value;
            let attrName = dataAttr.valueName;

            if (attrName.indexOf("class.") == 0) {
                let className = attrName.replace(/^class\./, '');
                el.classList.toggle(className, value == true );
            } else if (attrName.indexOf("class[") == 0) {
                let options = attrName.replace(/^class\[/, '').replace(/\]$/, '').split('|');
                let className = value + '';
                if (options.includes(className) || className === '') {
                    for (let clsName of options) {
                        if (clsName === className) {
                            el.classList.add(className);
                        } else {
                            el.classList.remove(clsName);
                        }
                    }
                } else console.warn(className + " is not a valid class name option: " + options.join(','));
            } else if (attrName.indexOf("style.") == 0) {
                let styleName = attrName.replace(/^style\./, '');
                el.style.setProperty(styleName, value + '');
            } else if (attrName.indexOf("!") == 0) {
                let an = attrName.replace(/^[!]/, '');
                if (value == true) el.setAttribute(an, an);
                else el.removeAttribute(an);
            } else {
                el.setAttribute(attrName, value + '');
            }
        }
        ret = true;
    }

    if (dataAttrsForEl.prop.length > 0) {
        for (let dataAttr of dataAttrsForEl.prop) {
            let value = dataAttr.value;
            let propName = dataAttr.valueName;

            if ((el as any).frmdbState) {
                (el as any).frmdbState[propName] = value;
            } else el[propName] = value;
        }
        ret = true;
    }

    if (dataAttrsForEl.value) {
        let value = dataAttrsForEl.value.value;

        if ("html" === dataAttrsForEl.value.valueName) {
            el.innerHTML = DOMPurify.sanitize(value);
        } else {
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
        }
        ret = true;
    }

    return ret;
}

export function isList(el: Elem): boolean {
    let attr = el.getAttribute('data-frmdb-foreach');
    if (!attr) return false;
    else return true;
}

export function deleteElem(el: Elem, childEl: Elem) {
    el.removeChild(childEl);
}

/**
 * Wraps Element in a div or another element
 * @param inputWrapper {Element | string} the wrapper element or tag name (defaults to "div")
 * @returns the wrapper element
 */
export function wrap(el: Element, inputWrapper: Element | string = 'div'): Element {
    if (!el.parentNode) {console.error("wrap called and parent not found", el, inputWrapper); return el;}
    let wrapper: Element;
    if (inputWrapper instanceof Element) {
        wrapper = inputWrapper;
    } else {
        wrapper = document.createElement(inputWrapper);
    }
    el.parentNode.insertBefore(wrapper, el);
    if (wrapper.tagName.toLowerCase() === 'template') {
        (wrapper as HTMLTemplateElement).content.appendChild(el);
    } else {
        wrapper.appendChild(el);
    } 
    return wrapper;
}

/**
 * Unwrap el: move el's children to el's parent
 * 
 * @param el Element
 * @returns parent of el
 */
export function unwrap(el: Element): Element {
    let parent = el.parentNode;
    if (!parent || !(parent instanceof Element)) {console.error("unwrap called and parent not found", el); return el;}

    let e = el.tagName.toLowerCase() === 'template' ? (el as HTMLTemplateElement).content : el ;
    // move all children out of the element
    while (e.firstChild) parent.insertBefore(e.firstChild, el);        

    // remove the empty element
    parent.removeChild(el);

    return parent;
}

const USE_TEMPLATE = true;
function isHidden(el: Element): boolean {
    if (USE_TEMPLATE) return el.matches('template[data-frmdb-if]');
    else return el.matches('script[type="text/html"][data-frmdb-if]');
}
function hide(el: Element, ifDataAttr: DataAttr) {
    if (USE_TEMPLATE) {
        wrap(el, 'template').setAttribute('data-frmdb-if', ifDataAttr.attrValue);
    } else {
        hideAsTemplate(el).setAttribute('data-frmdb-if', ifDataAttr.attrValue);
    }
}
function show(el: Element) {
    if (USE_TEMPLATE) {
        unwrap(el);
    } else {
        showFromTemplate(el);
    }
}

function hideAsTemplate(el: Element): Element {
    if (!el.parentNode) {console.error("wrap called and parent not found", el); return el;}
    let script: any = document.createElement('script');
    script.setAttribute("type", "text/html");
    script.text = el.outerHTML;
    el.parentNode.insertBefore(script, el);
    el.parentNode.removeChild(el);

    return script;
}
function showFromTemplate(el: Element): Element {
    if (!el.parentNode) {console.error("wrap called and parent not found", el); return el;}
    if (!el.matches('script[type="text/html"]')) throw new Error("hide called on a non-hidden element " + el);
    let htmlText = (el as any).text;//get text from script tag
    let newEl = document.createElement('div');
    el.parentNode.insertBefore(newEl, el);
    newEl.outerHTML = htmlText;
    newEl.setAttribute("data-frmdb-if", el.getAttribute("data-frmdb-if") || 'InternalErr!');
    el.parentNode.removeChild(el);

    return newEl;
}


const EMPTY_HTML_EL = document.createElement('div');
export function elvis_el(val): HTMLElement {
    return null == val ? EMPTY_HTML_EL : val;
}