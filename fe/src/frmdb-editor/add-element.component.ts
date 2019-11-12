import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { onEvent } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightBoxComponent;
    link: HTMLLinkElement | undefined = undefined;
    selectedEl: HTMLElement | undefined = undefined;
    action: FrmdbSelectPageElementAction['action'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = /*html*/`
            <style>
                :host {
                    position: absolute;
                    top: 5vh;
                    left: 5vw;
                    width: 85vw;
                    height: 85vh;
                    z-index: 98765;
                    overflow: hidden;
                    display: none;
                    background-color: white;
                }
                iframe {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <iframe src="/formuladb-themes/index.html"></iframe>
            <frmdb-highlight-box></frmdb-highlight-box>
        `;
        this.iframe = this.shadowRoot!.querySelector('iframe')!;
        this.highlightBox = this.shadowRoot!.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
        this.iframe.onload = () => {
            this.highlightBox.rootEl = this.iframe.contentWindow!.document;
            this.link = this.iframe.contentWindow!.document.head.querySelector('#frmdb-theme-css') as HTMLLinkElement;
            if (!this.link) console.warn("link #frmdb-theme-css not found!");
        }

        onEvent(this.highlightBox, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            if (!this.selectedEl) {console.warn("selectedEl not found"); return;}
            let targetDoc = this.selectedEl.ownerDocument;
            if (!targetDoc) {console.warn("owner doc not found"); return;}

            if (this.action === 'add-inside') {
                let newEl = this.copyEl(targetDoc, event.detail.el);
                this.selectedEl.appendChild(newEl);
            } else if (this.action === 'add-after') {
                let newEl = this.copyEl(targetDoc, event.detail.el);
                let p = this.selectedEl.parentElement;
                if (p) {
                    if (this.selectedEl.nextSibling) {
                        p.insertBefore(newEl, this.selectedEl.nextSibling);
                    } else {
                        p.appendChild(newEl);
                    }
                }
            }

            this.style.display = 'none';
        });
    }

    copyEl(doc: Document, el: HTMLElement): HTMLElement {
        let newEl = doc.createElement(el.tagName);
        newEl.innerHTML = el.innerHTML;
        for (let i = 0; i < el.attributes.length; i++) {
            let attr = el.attributes[i];
            newEl.setAttribute(attr.name, attr.value);
        }
        return newEl;
    }

    start(themeCssFile: string | null, selectedEl: HTMLElement, action: FrmdbSelectPageElementAction['action']) {
        if (!this.link) return;
        this.selectedEl = selectedEl;
        this.action = action;
        if (themeCssFile) this.link.href = themeCssFile;
        this.style.display = 'block';
    }
}
customElements.define('frmdb-add-element', AddElementComponent);
