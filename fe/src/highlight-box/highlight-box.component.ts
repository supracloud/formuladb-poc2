import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";
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
    rootEl: HTMLElement | undefined;
    private top: HTMLElement;
    private right: HTMLElement;
    private bottom: HTMLElement;
    private left: HTMLElement;
    static observedAttributes = ['root-element'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = html`
            <style>
                :host .border {
                    background-color: rgb(61, 133, 253);
                    position: fixed;
                }

                :host .border.left, :host .border.right {
                    width: 1px;
                }
                
                :host .border.top, :host .border.bottom {
                    height: 1px;
                }
                
            </style>
            <div class="border top"></div>
            <div class="border right"></div>
            <div class="border bottom"></div>
            <div class="border left"></div>
        `

        this.top = this.shadowRoot!.querySelector('.top') as HTMLElement;
        this.right = this.shadowRoot!.querySelector('.right') as HTMLElement;
        this.bottom = this.shadowRoot!.querySelector('.bottom') as HTMLElement;
        this.left = this.shadowRoot!.querySelector('.left') as HTMLElement;
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.rootEl = document.querySelector(newVal);
        this.init();
    }

    init() {
        if (!this.rootEl) return;

        onEvent(this.rootEl, 'mouseover', '*', _.debounce((event) => {
            console.log(event.target);
            let highlightEl: HTMLElement = event.target as HTMLElement;
            let offset = highlightEl.getBoundingClientRect();
            let height = highlightEl.clientHeight;
            let width = highlightEl.clientWidth;

            this.left.style.top = (offset.top + window.scrollY) + 'px';
            this.left.style.left = (offset.left - window.scrollX) + 'px';
            this.left.style.height = height + 'px';

            this.right.style.top = (offset.top + window.scrollY) + 'px';
            this.right.style.left = (offset.left - window.scrollX + width) + 'px';
            this.right.style.height = height + 'px';

            this.top.style.top = (offset.top + window.scrollY) + 'px';
            this.top.style.left = (offset.left - window.scrollX) + 'px';
            this.top.style.width = width + 'px';

            this.bottom.style.top = (offset.top + window.scrollY + height) + 'px';
            this.bottom.style.left = (offset.left - window.scrollX) + 'px';
            this.bottom.style.width = width + 'px';
        }, 50))
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
