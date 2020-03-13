import { $PageObjT } from "@domain/metadata/default-metadata";
import { PickOmit } from "@domain/ts-utils";

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
    let p: any = param;
    if (p.defaultView) return p.defaultView.document;
    if (p.ownerDocument) return p.ownerDocument;
    throw new Error("document not found for " + p); 
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

export function getPageProperties(doc: Document): PickOmit<$PageObjT, '_id' | 'name' | 'screenshot'> {
    return {
        title: doc.querySelector<HTMLTitleElement>('head title')?.textContent || '',
        author: doc.querySelector<HTMLMetaElement>('head meta[name="author"]')?.getAttribute('content') || '',
        description: doc.querySelector<HTMLMetaElement>('head meta[name="description"]')?.getAttribute('content') || '',
        frmdb_display_date: doc.querySelector<HTMLMetaElement>('head meta[name="frmdb_display_date"]')?.getAttribute('content') || '',
    };
}
export function setPageProperties(headEl: HTMLHeadElement, pageProps: PickOmit<$PageObjT, '_id' | 'name' | 'screenshot'>) {
    let title: HTMLHeadElement | null = headEl.querySelector('title');
    if (!title) {
        title = getDoc(headEl).createElement('title');
        headEl.appendChild(title);
    } 
    title.textContent = pageProps.title;
    
    for (let [metaName, metaValue] of [
        ['author', pageProps.author ],
        ['description', pageProps.description ],
        ['frmdb_display_date', pageProps.frmdb_display_date ],
    ]) {
        let el: HTMLMetaElement | null = headEl.querySelector(`meta[name="${metaName}"]`);
        if (!el) {
            el = getDoc(headEl).createElement('meta');
            el.setAttribute('name', metaName);
            headEl.appendChild(el);
        } 
        el.setAttribute('content', metaValue);
    }
}