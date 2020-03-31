const { JSDOM } = require('jsdom');
import { HTMLTools, isHTMLElement } from "@core/html-tools";
import * as fs from 'fs';
import { cleanupDocumentDOM } from "@core/page-utils";

export function replaceCssClassWithTag(filePath: string, name: string) {
    let html = fs.readFileSync(filePath).toString();
    const jsdom = new JSDOM(html, {}, {
        features: {
            'FetchExternalResources': false,
            'ProcessExternalResources': false
        }
    });
    const htmlTools = new HTMLTools(jsdom.window.document, new jsdom.window.DOMParser());
    let cleanedUpDOM = cleanupDocumentDOM(htmlTools.doc);

    for (let el of Array.from(cleanedUpDOM.querySelectorAll(`.${name}`))) {
        let newEl = htmlTools.doc.createElement(name);
        newEl.innerHTML = el.innerHTML;
        for (let attr of Array.from(el.attributes)) {
            newEl.setAttribute(attr.name, attr.value);
        }
        newEl.classList.remove(name);
        el.parentElement!.replaceChild(newEl, el);
    }

    for (let el of Array.from(cleanedUpDOM.querySelectorAll(`frmdb-t-img > img`))) {
        el.parentElement!.setAttribute("style", `--frmdb-bg-img: url('${el.getAttribute("src")}')`);
        el.parentElement!.removeChild(el);
    }

    for (let el of Array.from(cleanedUpDOM.querySelectorAll(`section.my-5.py-5.frmdb-bg.frmdb-bg-parallax`))) {
        let newEl = htmlTools.doc.createElement('frmdb-t-media-section-main');
        newEl.innerHTML = el.innerHTML;
        for (let attr of Array.from(el.attributes)) {
            newEl.setAttribute(attr.name, attr.value);
        }
        newEl.removeAttribute("class");
        newEl.prepend(htmlTools.doc.createElement('frmdb-t-section-divider'));
        newEl.append(htmlTools.doc.createElement('frmdb-t-section-divider'));
        el.parentElement!.replaceChild(newEl, el);
    }
    
    for (let el of Array.from(cleanedUpDOM.querySelectorAll(`section.my-5.py-5.frmdb-section-dark.frmdb-bg-tint-parallax.frmdb-bg-tint-secondary-75`))) {
        let newEl = htmlTools.doc.createElement('frmdb-t-section-cards-icon');
        newEl.innerHTML = el.innerHTML;
        for (let attr of Array.from(el.attributes)) {
            newEl.setAttribute(attr.name, attr.value);
        }
        newEl.removeAttribute("class");
        newEl.prepend(htmlTools.doc.createElement('frmdb-t-section-divider'));
        newEl.append(htmlTools.doc.createElement('frmdb-t-section-divider'));
        el.parentElement!.replaceChild(newEl, el);
    }    

    let newHtml = htmlTools.document2html(cleanedUpDOM);
    fs.writeFileSync(filePath, newHtml);
}
