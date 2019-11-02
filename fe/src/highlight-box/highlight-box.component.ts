import * as _ from "lodash";
import { onEvent, emit } from "@fe/delegated-events";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    highlightEl: HTMLElement | undefined;
    hoverBox: HTMLElement;
    clickedBox: HTMLElement;
    dblclickedBox: HTMLElement;
    static observedAttributes = ['root-element'];

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
        this.hoverBox = this.shadowRoot!.querySelector('#hover') as HTMLElement;
        this.clickedBox = this.shadowRoot!.querySelector('#clicked') as HTMLElement;
        this.dblclickedBox = this.shadowRoot!.querySelector('#dblclicked') as HTMLElement;
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this._rootEl = document.querySelector(newVal);
        this.init();
    }

    init() {
        if (!this._rootEl) return;

        onEvent(this._rootEl, ['click'], '*', (event) => {
            event.preventDefault();

            let el: HTMLElement = event.target as HTMLElement;
            this.showBox(this.clickedBox, el);

            emit(this, {type: "FrmdbSelectPageElement", el});
        });

        onEvent(this._rootEl, ['mousemove'], '*', (event) => {
            event.preventDefault();

            let highlightEl: HTMLElement = event.target as HTMLElement;
            this.showBox(this.hoverBox, highlightEl);
        });
    }

    showBox(box: HTMLElement, highlightEl: HTMLElement) {
        if (!highlightEl.tagName) return;
        if (["frmdb-dom-tree", "frmdb-highlight-box", "body"]
            .includes(highlightEl.tagName.toLowerCase())) return;

        let offset = highlightEl.getBoundingClientRect();
        let height = highlightEl.clientHeight;
        let width = highlightEl.clientWidth;

        box.style.top = (offset.top) + 'px';
        box.style.left = (offset.left) + 'px';
        box.style.height = height + 'px';
        box.style.width = width + 'px';
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
