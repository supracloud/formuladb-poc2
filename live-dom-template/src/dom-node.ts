import * as isNode from 'detect-node';

let parser, serializer;
console.error(isNode);
if (isNode) {
    require('jsdom-global')();
    parser = new (window as any).DOMParser();
    serializer = new (window as any).XMLSerializer();
} else {
    parser = new DOMParser();
    serializer = new XMLSerializer();
}
export type Elem = Element;
export class ElemList {
    constructor(private key: string, private parentEl: Elem) {}

    get length() {
        return this.parentEl.querySelectorAll(`[data-frmdb-foreach="${this.key}"]`).length;
    }

    public addElem() {
        let firstEl = this.parentEl.firstChild;
        if (!firstEl) firstEl = createElem('div', this.key);
        this.parentEl.appendChild(firstEl.cloneNode(true));
    }

    public addTo(parentEl: Elem) {
        parentEl.appendChild(this.parentEl);
    }

    public at(idx: number): Elem | null{
        let list = this.parentEl.querySelectorAll(`[data-frmdb-foreach="${this.key}"]`);
        if (list.length < idx) return null;
        else return list[idx];
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
    let attr = document.createAttribute("data-frmdb-valueof");
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

export function path2css(path: string): string {
    return path.replace(/\//g, " ");
}

export function findElem(el: Elem, path: string): Elem | null {
    return el.querySelector(path2css(path));
}

export function getElem(el: Elem, key: string): Elem | null {
    return el.querySelector(`[data-frmdb-valueof="${key}"]`);
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

export function setElemValue(el: Elem, value: string|boolean|number|Date) {
    el.textContent = "" + value;
    //FIXME: form inputs have different ways of setting the value
}

export function setElem(el: Elem, key: string, childEl: Elem) {
    let existingChildEl = getElem(el, key);
    if (existingChildEl) { 
        el.replaceChild(existingChildEl, childEl);
    } else {
        el.appendChild(childEl);
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
