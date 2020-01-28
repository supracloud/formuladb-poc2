export function isDocument(param): param is Document {
    return param.defaultView && param.defaultView.Document && param instanceof param.defaultView.Document;
}

export function isHTMLElement(param): param is HTMLElement {
    return param.ownerDocument && param.ownerDocument.defaultView && param.ownerDocument.defaultView.HTMLElement && param instanceof param.ownerDocument.defaultView.HTMLElement;
}

export function getWindow(param: Document | ShadowRoot | HTMLElement): Window {
    let p: any = param;
    if (p.defaultView) return p.defaultView;
    if (p.ownerDocument && p.ownerDocument.defaultView) return p.ownerDocument.defaultView;
    throw new Error("window not found for " + p); 
}