import { onEventChildren, emit } from "@fe/delegated-events";
import { $FMODAL } from "@fe/directives/data-toggle-modal.directive";
import { HighlightComponent } from "@fe/highlight/highlight.component";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/add-element.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/add-element.component.scss').default;

export class AddElementComponent extends HTMLElement {
    iframe: HTMLIFrameElement;
    highlightBox: HighlightComponent;
    nav: HTMLElement;

    connectedCallback() {
        setTimeout(() => this.init(), 6000);
    }
    init() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;
        this.iframe = this.querySelector('iframe')!;
        this.highlightBox = this.querySelector('frmdb-highlight-box') as HighlightComponent;
        this.nav = this.querySelector('nav') as HTMLElement;
        this.iframe.onload = () => {
            this.highlightBox.rootEl = this.iframe.contentWindow!.document.body;
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
    }

    triggerAddElementFlow(event: MouseEvent) {
        if (!this.highlightBox.highlightEl) return;
        let newEl: HTMLElement = this.highlightBox.highlightEl.cloneNode(true) as HTMLElement;
        emit(this, {type: "FrmdbAddPageElementStart", html: newEl.outerHTML});
        $FMODAL('#add-element-modal', 'hide');
    }

    start() {
        this.iframe.contentWindow!.location.reload();
        $FMODAL('#add-element-modal');
    }
}
customElements.define('frmdb-add-element', AddElementComponent);
