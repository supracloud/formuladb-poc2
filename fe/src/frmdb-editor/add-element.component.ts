import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { onEvent, onEventChildren } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { Undo } from "./undo";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/add-element.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/add-element.component.scss').default;

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightBoxComponent;
    nav: HTMLElement;
    link: HTMLLinkElement | undefined = undefined;
    selectedEl: HTMLElement | undefined = undefined;
    action: FrmdbSelectPageElementAction['action'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.iframe = this.shadowRoot!.querySelector('iframe')!;
        this.highlightBox = this.shadowRoot!.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
        this.nav = this.shadowRoot!.querySelector('nav') as HTMLElement;
        this.iframe.onload = () => {
            this.highlightBox.rootEl = this.iframe.contentWindow!.document;
            this.link = this.iframe.contentWindow!.document.head.querySelector('#frmdb-theme-css') as HTMLLinkElement;
            if (!this.link) console.warn("link #frmdb-theme-css not found!");
        }

        onEventChildren(this.nav, 'click', '.nav-item', (event) => {
            this.iframe.src = `/formuladb-themes/${event.target.id}.html`;
        });

        onEvent(this.highlightBox, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            if (!this.selectedEl) {console.warn("selectedEl not found"); return;}
            let targetDoc = this.selectedEl.ownerDocument;
            if (!targetDoc) {console.warn("owner doc not found"); return;}

            if (this.action === 'add-inside') {
                let newEl = targetDoc.importNode(event.detail.el, true);
                this.selectedEl.appendChild(newEl);
                Undo.addMutation({
                    type: 'childList',
                    target: this.selectedEl,
                    addedNodes: [newEl],
                    nextSibling: newEl.nextElementSibling
                });
            } else if (this.action === 'add-after') {
                let newEl = targetDoc.importNode(event.detail.el, true);
                let p = this.selectedEl.parentElement;
                if (p) {
                    p.insertBefore(newEl, this.selectedEl.nextSibling);
                    Undo.addMutation({
                        type: 'childList',
                        target: p,
                        addedNodes: [newEl],
                        nextSibling: newEl.nextElementSibling
                    });
                }
            }

            this.style.display = 'none';
        });
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
