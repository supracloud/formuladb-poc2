import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { applyTheme } from "@fe/frmdb-themes";
import { $FMODAL } from "@fe/directives/data-toggle-modal.directive";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/add-element.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/add-element.component.scss').default;

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightBoxComponent;
    nav: HTMLElement;
    link: HTMLLinkElement | undefined = undefined;
    selectedEl: HTMLElement | undefined = undefined;
    action: FrmdbSelectPageElementAction['action'];
    lookCssFile: string | undefined;
    themeName: string | undefined;

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.iframe = this.querySelector('iframe')!;
        this.highlightBox = this.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
        this.nav = this.querySelector('nav') as HTMLElement;
        this.iframe.onload = () => {
            this.highlightBox.enableActionsEvents = false;
            this.highlightBox.rootEl = this.iframe.contentWindow!.document;
            this.link = this.iframe.contentWindow!.document.head.querySelector('#frmdb-theme-css') as HTMLLinkElement;
            if (!this.link) console.warn("link #frmdb-theme-css not found!");
            if (this.lookCssFile) this.link.href = this.lookCssFile;
            if (this.themeName) {
                applyTheme(this.themeName, this.iframe.contentWindow!.document);
            }
        }

        onEvent(this.highlightBox, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            if (!this.selectedEl) {console.warn("selectedEl not found"); return;}
            let targetDoc = this.selectedEl.ownerDocument;
            if (!targetDoc) {console.warn("owner doc not found"); return;}

            if (this.action === 'add-inside') {
                let newEl = targetDoc.importNode(event.detail.el, true);
                this.selectedEl.appendChild(newEl);
                emit(newEl.ownerDocument!, {type: "FrmdbAddPageElement", el: newEl});
            } else if (this.action === 'add-after') {
                let newEl = targetDoc.importNode(event.detail.el, true);
                let p = this.selectedEl.parentElement;
                if (p) {
                    p.insertBefore(newEl, this.selectedEl.nextSibling);
                    emit(newEl.ownerDocument!, {type: "FrmdbAddPageElement", el: newEl});
                }
            }

            $FMODAL('#add-element-modal', 'hide');
        });
    }

    start(lookCssFile: string | undefined, themeName: string, selectedEl: HTMLElement, action: FrmdbSelectPageElementAction['action']) {
        if (!this.link) return;
        this.selectedEl = selectedEl;
        this.action = action;
        this.lookCssFile = lookCssFile;
        this.themeName = themeName;
        this.iframe.contentWindow!.location.reload();
                
        $FMODAL('#add-element-modal');
    }
}
customElements.define('frmdb-add-element', AddElementComponent);
