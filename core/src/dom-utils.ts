export function isDocument(param): param is Document {
    return param?.defaultView?.Document && param instanceof param.defaultView.Document;
}

export function isShadowRoot(param): param is ShadowRoot {
    return param?.ownerDocument?.defaultView?.ShadowRoot && param instanceof param.ownerDocument.defaultView.ShadowRoot;
}

export function isHTMLElement(param): param is HTMLElement {
    return param?.ownerDocument?.defaultView?.HTMLElement && param instanceof param.ownerDocument.defaultView.HTMLElement;
}

export function getWindow(param: Document | ShadowRoot | HTMLElement): Window {
    let p: any = param;
    if (p.defaultView) return p.defaultView;
    if (p.ownerDocument && p.ownerDocument.defaultView) return p.ownerDocument.defaultView;
    throw new Error("window not found for " + p); 
}

export function getDoc(param: Document | ShadowRoot | HTMLElement): Document {
    return getWindow(param).document;
}

export function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function getSiblingIndex(el: HTMLElement) {
    if (!el) return 0;
    
    let siblingIndex: number = 1;
    let prev = el.previousElementSibling;
    while (prev) {
        siblingIndex++;
        prev = prev.previousElementSibling;
    }
    return siblingIndex;
}