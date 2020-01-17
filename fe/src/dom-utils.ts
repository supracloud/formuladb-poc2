export function isDocument(param): param is Document {
    return param.defaultView && param.defaultView.Document && param instanceof param.defaultView.Document;
}

export function isHTMLElement(param): param is HTMLElement {
    return param.ownerDocument && param.ownerDocument.defaultView && param.ownerDocument.defaultView.HTMLElement && param instanceof param.ownerDocument.defaultView.HTMLElement;
}
