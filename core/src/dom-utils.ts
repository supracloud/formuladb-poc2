import { $PageObjT } from "@domain/metadata/default-metadata";
import { PickOmit } from "@domain/ts-utils";
import { AllPageOpts, PageLookAndTheme } from "@domain/url-utils";

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

export function getPageProperties(doc: Document | HTMLHeadElement): PickOmit<$PageObjT, '_id' | 'name' | 'screenshot' | 'template_url'> {
    let headEl = isDocument(doc) ? doc.head : doc;
    return {
        title: headEl.querySelector<HTMLTitleElement>('title')?.textContent || '',
        author: headEl.querySelector<HTMLMetaElement>('meta[name="author"]')?.getAttribute('content') || '',
        description: headEl.querySelector<HTMLMetaElement>('meta[name="description"]')?.getAttribute('content') || '',
        frmdb_display_date: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_display_date"]')?.getAttribute('content') || '',
        frmdb_featured_page_order: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_featured_page_order"]')?.getAttribute('content') || '',
        frmdb_look: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_look"]')?.getAttribute('content') || '',
        frmdb_primary_color: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_primary_color"]')?.getAttribute('content') || '',
        frmdb_secondary_color: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_secondary_color"]')?.getAttribute('content') || '',
        frmdb_theme: headEl.querySelector<HTMLMetaElement>('meta[name="frmdb_theme"]')?.getAttribute('content') || '',
    };
}
export function setPageProperties(headEl: HTMLHeadElement, pageProps: PickOmit<$PageObjT, '_id' | 'name' | 'screenshot' | 'template_url'>) {
    let title: HTMLHeadElement | null = headEl.querySelector('title');
    if (!title) {
        title = getDoc(headEl).createElement('title');
        headEl.appendChild(title);
    } 
    title.textContent = pageProps.title;

    let fullProps = getPageProperties(headEl);
    let newPageObj = {...fullProps, ...pageProps};

    for (let [metaName, metaValue] of [
        ['author', pageProps.author ],
        ['description', pageProps.description ],
        ['frmdb_display_date', pageProps.frmdb_display_date ],
        ['frmdb_featured_page_order', pageProps.frmdb_featured_page_order ],
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

export function removePageProperties(headEl: HTMLHeadElement) {
    for (let metaName of [
        'author',
        'description',
        'frmdb_display_date',
        'frmdb_featured_page_order',
    ]) {
        let el: HTMLMetaElement | null = headEl.querySelector(`meta[name="${metaName}"]`);
        if (el) {
            headEl.removeChild(el);
        } 
    }

}
export function removePageLookAndTheme(headEl: HTMLHeadElement) {
    for (let metaName of [
        'frmdb_look',
        'frmdb_primary_color',
        'frmdb_secondary_color',
        'frmdb_theme',
    ]) {
        let el: HTMLMetaElement | null = headEl.querySelector(`meta[name="${metaName}"]`);
        if (el) {
            headEl.removeChild(el);
        } 
    }

}
export function setPageLookAndTheme(headEl: HTMLHeadElement, pageOpts: Required<PageLookAndTheme>) {
    for (let [metaName, metaValue] of [
        ['frmdb_look', pageOpts.look ],
        ['frmdb_primary_color', pageOpts.primaryColor ],
        ['frmdb_secondary_color', pageOpts.secondaryColor ],
        ['frmdb_theme', pageOpts.theme ],
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