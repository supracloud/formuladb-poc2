const { JSDOM } = require('jsdom');
import { HTMLTools, isHTMLElement } from "@core/html-tools";
import * as fs from 'fs';
import { cleanupDocumentDOM } from "@core/page-utils";

export function replaceCssClassWithTag(filePath: string, name: string) {
    let html = fs.readFileSync(process.argv[1]).toString();
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
        el.parentElement!.replaceChild(newEl, el);
    }

    fs.writeFileSync(filePath, htmlTools.document2html(cleanedUpDOM));
}
