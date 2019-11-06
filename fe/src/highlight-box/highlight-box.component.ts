import * as _ from "lodash";
import { onEvent, emit } from "@fe/delegated-events";
import { WysiwygEditor } from "./wysiwyg-editor";
import { isElementWithTextContentEditable } from "@fe/i18n-fe";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    highlightEl: HTMLElement | undefined;
    highlightBox: HTMLElement;
    selectedBox: HTMLElement;
    selectedEl: HTMLElement | undefined;
    static observedAttributes = ['root-element'];
    wysiwygEditor = new WysiwygEditor();

    set rootElement(selector: string) {
        this.setAttribute('root-element', selector);
    }

    set rootEl(el: HTMLElement | Document) {
        this._rootEl = el;
        this.init();
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style>${HTML}`;
        this.highlightBox = this.shadowRoot!.querySelector('#highlight') as HTMLElement;
        this.selectedBox = this.shadowRoot!.querySelector('#selected') as HTMLElement;
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this._rootEl = document.querySelector(newVal);
        this.init();
    }

    init() {
        if (!this._rootEl) return;

        this.wysiwygEditor.init((this._rootEl as any).execCommand != null ? this._rootEl as Document : this._rootEl.ownerDocument!, 
            this.selectedBox.querySelector('.actions.editing')! as HTMLElement);

        onEvent(this._rootEl, ['mousemove'], '*', (event) => {
            event.preventDefault();
            let highlightEl: HTMLElement = event.target as HTMLElement;
            this.showBox(this.highlightBox, highlightEl);
        });


        onEvent(this._rootEl, ['click'], '*', (event: MouseEvent) => {
            event.preventDefault();
            if (this.wysiwygEditor.isActive && this.selectedEl && 
                (this.selectedEl == event.target || this.selectedEl.contains(event.target as HTMLElement))) return;
            this.selectedEl = event.target as HTMLElement;
            this.showBox(this.selectedBox, this.selectedEl);
            this.toggleWysiwygEditor(false);
            emit(this, {type: "FrmdbSelectPageElement", el: this.selectedEl});
        });

        onEvent(this.selectedBox, ['click'], '#edit-btn, #edit-btn *', (event) => {
            event.preventDefault();
            if (!this.selectedEl || !isElementWithTextContentEditable(this.selectedEl)) return;
            this.toggleWysiwygEditor(true);
            emit(this, {type: "FrmdbEditWysiwygPageElement", el: this.selectedEl});
        });
    }

    toggleWysiwygEditor(active: boolean) {
        if (!this.selectedEl) return;

        this.selectedBox.classList.toggle('editing', active);

        if (active) this.wysiwygEditor.start(this.selectedEl);
        else this.wysiwygEditor.destroy();
    }

    showBox(box: HTMLElement, highlightEl: HTMLElement) {
        if (!highlightEl.tagName) return;
        if (["frmdb-dom-tree", "frmdb-highlight-box", "body"]
            .includes(highlightEl.tagName.toLowerCase())) return;

        let offset = highlightEl.getBoundingClientRect();
        let height = highlightEl.clientHeight;
        let width = highlightEl.clientWidth;

        box.style.display = 'block';
        box.style.top = (offset.top) + 'px';
        box.style.left = (offset.left) + 'px';
        box.style.height = height + 'px';
        box.style.width = width + 'px';
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
