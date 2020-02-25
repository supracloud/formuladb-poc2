import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { applyTheme, ThemeRules } from "@core/frmdb-themes";
import { $FMODAL } from "@fe/directives/data-toggle-modal.directive";
import { loadPage } from "@fe/fe-functions";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/add-element.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/add-element.component.scss').default;

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightBoxComponent;
    nav: HTMLElement;
    selectedEl: HTMLElement | undefined = undefined;
    action: FrmdbSelectPageElementAction['action'];

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.iframe = this.querySelector('iframe')!;
        this.highlightBox = this.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
        this.highlightBox.enableSelectedActionsEvents = false;
        this.highlightBox.enableAddElementActionsEvents = true;
        this.nav = this.querySelector('nav') as HTMLElement;
        this.iframe.onload = () => {
            this.highlightBox.rootEl = this.iframe.contentWindow!.document;
            this.iframe.contentWindow!.document.querySelector('[data-frmdb-fragment="_nav.html"]')?.setAttribute("data-frmdb-highlight-ignore", "");
        }

        fetch('/formuladb-env/frmdb-apps/themes/components-nav.html', {
            headers: {
                'accept': 'text/html',
            },
        }).then(async (res) => {
            let html = await res.text();
            this.querySelector('#components-nav')!.innerHTML = html;
        });

        onEventChildren(this, 'click', '#components-nav a', (ev: MouseEvent) => {
            ev.preventDefault();
            this.iframe.src = (ev.target as any)?.href;
        })

        onEvent(this.highlightBox, 'FrmdbChoosePageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
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

    start(selectedEl: HTMLElement, action: FrmdbSelectPageElementAction['action']) {
        this.selectedEl = selectedEl;
        this.action = action;
        this.iframe.contentWindow!.location.reload();
                
        $FMODAL('#add-element-modal');
    }
}
customElements.define('frmdb-add-element', AddElementComponent);
