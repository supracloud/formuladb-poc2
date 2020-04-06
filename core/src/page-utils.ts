declare var document: null;

export function cleanupDocumentDOM(doc: Document): HTMLElement {

    let cleanedUpDOM: HTMLElement = doc.documentElement.cloneNode(true) as HTMLElement;

    //cleanup stelar.js styles
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('[data-stellar-vertical-offset]'))) {
        (el as HTMLElement).style.removeProperty('transform');
    }

    //cleanup isotope.js styles
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('[data-category]'))) {
        (el as HTMLElement).style.removeProperty('position');
        (el as HTMLElement).style.removeProperty('left');
        (el as HTMLElement).style.removeProperty('top');
        (el as HTMLElement).style.removeProperty('display');
    }
    for (let isotopeGrid of Array.from(cleanedUpDOM.querySelectorAll('.frmdb-isotope-grid.grid'))) {
        (isotopeGrid as HTMLElement).style.removeProperty('position');
        (isotopeGrid as HTMLElement).style.removeProperty('height');
    }

    //cleanup responsive nav dropdown
    {
        let el = doc.querySelector('.frmdb-responsive-nav-more-items-dropdown');
        while (el && el.firstChild) el.removeChild(el.firstChild);
    }

    //cleanup tracking code
    for (let jsEl of Array.from(cleanedUpDOM.querySelectorAll('head > script[src="https://www.google-analytics.com/analytics.js"]'))) {
        if (jsEl.parentElement) {
            jsEl.parentElement.removeChild(jsEl);
        }
    }
    for (let jsEl of Array.from(cleanedUpDOM.querySelectorAll('head > script[src*="hotjar.com"]'))) {
        if (jsEl.parentElement) {
            jsEl.parentElement.removeChild(jsEl);
        }
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('iframe#_hjRemoteVarsFrame'))) {
        el.parentElement!.removeChild(el);
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('.frmdb-editor-on'))) {
        el.classList.remove('frmdb-editor-on');
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('frmdb-highlight-box'))) {
        el.parentElement!.removeChild(el);
    }

    return cleanedUpDOM;
}
