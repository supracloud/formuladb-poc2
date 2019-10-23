import * as _ from "lodash";
import { onEvent, emit } from "@fe/delegated-events";
import { html } from "@fe/live-dom-template/live-dom-template";

const HTML = html`
    <div class="overlay">
        <div id="highlight-name"></div>

        <div id="section-actions">
            <a id="add-section-btn" href="" title="Add element">M</a>
        </div>
    </div>
`;

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    highlightEl: HTMLElement | undefined;
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
        this.shadowRoot!.innerHTML = html`
            <style>
                :host {
                    position: absolute;
                    display: block;
                    border: 1px solid rgb(61, 133, 253);
                    background-color: rgba(61, 133, 253, 0.05);
                    pointer-events: none;
                    z-index: 45678;
                }
            </style>
        `;
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
            if (!el.tagName) return;
            if (["frmdb-dom-tree", "frmdb-data-grid", "body"]
                .includes(el.tagName.toLowerCase())) return;

            emit(this, {type: "FrmdbSelectPageElement", el});
        });

        onEvent(this._rootEl, ['mousemove'], '*', (event) => {
            event.preventDefault();

            let highlightEl: HTMLElement = event.target as HTMLElement;
            if (!highlightEl.tagName) return;
            if (["frmdb-dom-tree", "frmdb-data-grid", "body"]
                .includes(highlightEl.tagName.toLowerCase())) return;

            let offset = highlightEl.getBoundingClientRect();
            let height = highlightEl.clientHeight;
            let width = highlightEl.clientWidth;

            this.style.top = (offset.top) + 'px';
            this.style.left = (offset.left) + 'px';
            this.style.height = height + 'px';
            this.style.width = width + 'px';
        });
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
