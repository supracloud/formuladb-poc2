import * as _ from "lodash";
import { getDocumentOf } from "@core/dom-utils";

const HTML: string = require('raw-loader!@fe-assets/carousel/carousel.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/carousel/carousel.component.scss').default;

export class CarouselComponent extends HTMLElement {
    static observedAttributes = ['root-element', 'highlighted-element', 'margin'];
    _margin: number = 0;
    _rootEl: HTMLElement | null = null;
    _highlightEl: HTMLElement | null = null;

    set margin(m: number) {
        this._margin = m;
        this.render();
    }

    set highlightEl(el: HTMLElement | null) {
        this._highlightEl = el;
        this.render();
    }
    get highlightEl(): HTMLElement | null {
        return this._highlightEl;
    }

    set rootEl(el: HTMLElement) {
        this._rootEl = el;
        this.render();
    }
    get rootEl() {
        return this._rootEl || getDocumentOf(this).body;
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style>${HTML}`;
    }


    attributeChangedCallback(name: any, oldVal: string, newVal: string) {
        if ('highlighted-element' === name) {
            this.highlightEl = this.rootEl.querySelector(newVal) as HTMLElement;
        } else if ('root-element' === name) {
            this.rootEl = getDocumentOf(this).querySelector(newVal) as HTMLElement;
        } else if ('margin' === name) {
            this._margin = parseInt(newVal);
            this.render();
        }
    }

    render() {
        if (!this._highlightEl) {
            this.style.display = 'none';
            return;
        }
        this.style.display = "block";
    
        let offset = this._highlightEl.getBoundingClientRect();
        let height = this._highlightEl.clientHeight;
        let width = this._highlightEl.clientWidth;

        if (offset.top <= 20) this.classList.add('is-at-top')
        else this.classList.remove('is-at-top');

        this.style.display = 'block';
        this.style.top = Math.max(offset.top - this._margin, 0) + 'px';
        this.style.left = Math.max(offset.left - this._margin, 0) + 'px';
        this.style.height = (height + 2 * this._margin) + 'px';
        this.style.width = (width + 2 * this._margin) + 'px';
    }
}

customElements.define('frmdb-carousel', CarouselComponent);
