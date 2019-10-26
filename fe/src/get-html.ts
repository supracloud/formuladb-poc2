import { normalizeDOM2HTML } from "@core/normalize-html";

export function getHtml(doc: Document) {
    let hasDoctpe = (doc.doctype !== null);
    let html = "";

    if (hasDoctpe) html = "<!DOCTYPE "
        + doc.doctype!.name
        //@ts-ignore
        + (doc.doctype.publicId ? ' PUBLIC "' + doc.doctype.publicId + '"' : '')
        //@ts-ignore
        + (!doc.doctype.publicId && doc.doctype.systemId ? ' SYSTEM' : '')
        //@ts-ignore
        + (doc.doctype.systemId ? ' "' + doc.doctype.systemId + '"' : '')
        + ">\n";

    let cleanedUpDOM: HTMLElement = doc.documentElement.cloneNode(true) as HTMLElement;
    for (let frmdbFragment of Array.from(cleanedUpDOM.querySelectorAll('frmdb-fragment'))) {
        // frmdbFragment.innerHTML = '';//For SEO better to keep this content
    }

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
        let el = document.querySelector('.frmdb-responsive-nav-more-items-dropdown');
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
    for (let stEl of Array.from(cleanedUpDOM.getElementsByTagName('style'))) {
        if ((stEl.textContent || '').indexOf('iframe#_hjRemoteVarsFrame') >= 0) {
            stEl.parentElement!.removeChild(stEl);
        }
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('.frmdb-editor-on'))) {
        el.classList.remove('frmdb-editor-on');
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('frmdb-highlight-box'))) {
        el.parentElement!.removeChild(el);
    }

    html += normalizeDOM2HTML(cleanedUpDOM) + "\n</html>";

    html = html.replace(/<.*?data-vvveb-helpers.*?>/gi, "");
    html = html.replace(/\s*data-vvveb-\w+(=["'].*?["'])?\s*/gi, "");
    html = html.replace(/\s*<!-- Code injected by live-server(.|\n)+<\/body>/, '</body>');

    return html;
}
