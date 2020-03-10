import { onEventChildren, emit } from "@fe/delegated-events";
import { $FRMDB_MODAL } from "@fe/directives/data-toggle-modal.directive";
import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/add-element.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/add-element.component.scss').default;

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightBoxComponent;
    nav: HTMLElement;

    connectedCallback() {
        setTimeout(() => this.init(), 6000);
    }
    init() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.iframe = this.querySelector('iframe')!;
        this.highlightBox = this.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
        this.nav = this.querySelector('nav') as HTMLElement;
        this.iframe.onload = () => {
            this.highlightBox.rootEl = this.iframe.contentWindow!.document.body;
            this.iframe.contentWindow!.document.querySelector('[data-frmdb-fragment="_nav.html"]')?.setAttribute("data-frmdb-highlight-ignore", "");
        }

        fetch('/formuladb-env/frmdb-apps/base-app/components-nav.html', {
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
    }

    triggerAddElementFlow(event: MouseEvent) {
        if (!this.highlightBox.selectedBox.highlightEl) return;
        let newEl: HTMLElement = this.highlightBox.selectedBox.highlightEl.cloneNode(true) as HTMLElement;
        emit(this, {type: "FrmdbAddPageElementStart", htmlElement: newEl});
        $FRMDB_MODAL('#add-element-modal', 'hide');
    }

    start() {
        this.iframe.contentWindow!.location.reload();
        $FRMDB_MODAL('#add-element-modal');
    }
}
customElements.define('frmdb-add-element', AddElementComponent);
