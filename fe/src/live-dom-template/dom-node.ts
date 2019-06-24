import * as isNode from 'detect-node';

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
    return el.querySelector(`[data-frmdb-valueof="${key}"]`) || el.querySelector(`[data-frmdb-attr^="${key}:"]`);
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

export function setElemValue(el: Elem, key: string, value: string|boolean|number|Date) {
    let dataAttr = el.getAttribute('data-frmdb-attr');
    if (dataAttr && dataAttr.indexOf(key + ':') === 0) {
        let attrName = dataAttr.replace(/^.*:/, '');
        if (attrName.indexOf("class.") == 0) {
            let className = attrName.replace(/^class\./, '');
            el.classList.toggle(className, value == true );
        } else if (attrName.indexOf("style.") == 0) {
            let styleName = attrName.replace(/^style\./, '');
            el.style.setProperty(styleName, value + '');
        } else {
            el.setAttribute(attrName, value + '');
        }
    } else if (el.getAttribute('data-frmdb-valueof') == key) {
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
    } else throw new Error("El " + el + " does not have data binding for key " + key);

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
