import * as _ from "lodash";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { WysiwygEditor } from "./wysiwyg-editor";
import { isElementWithTextContentEditable } from "@fe/i18n-fe";
import { FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    _disabled: boolean = false;
    highlightEl: HTMLElement | undefined;
    highlightBox: HTMLElement;
    parentHighlightBox: HTMLElement;
    grandParentHighlightBox: HTMLElement;
    selectedBox: HTMLElement;
    selectedEl: HTMLElement | undefined;
    static observedAttributes = ['root-element', 'disabled'];
    wysiwygEditor = new WysiwygEditor();

    set rootElement(selector: string) {
        this.setAttribute('root-element', selector);
    }
    set disabled(d: boolean) {
        this.setAttribute('disabled', new Boolean(d).toString());
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
        this.parentHighlightBox = this.shadowRoot!.querySelector('#parent-highlight') as HTMLElement;
        this.grandParentHighlightBox = this.shadowRoot!.querySelector('#grand-parent-highlight') as HTMLElement;
        this.selectedBox = this.shadowRoot!.querySelector('#selected') as HTMLElement;
    }

    attributeChangedCallback(name: any, oldVal: string, newVal: string) {
        if ('root-element' === name) {
            this._rootEl = document.querySelector(newVal) as HTMLElement;
            this.init();
        } else if ('disabled' === name) {
            this._disabled = (newVal.toLowerCase() == "true");
        }
    }

    init() {
        if (!this._rootEl) return;

        this.wysiwygEditor.init((this._rootEl as any).execCommand != null ? this._rootEl as Document : this._rootEl.ownerDocument!, 
            this.selectedBox.querySelector('.actions.editing')! as HTMLElement);

        onEvent(this._rootEl, ['mousemove'], '*', (event) => {
            if (this._disabled) return;
            event.preventDefault();
            let highlightEl: HTMLElement = event.target as HTMLElement;
            this.showBox(this.highlightBox, highlightEl);
            if (highlightEl.parentElement) {
                this.showBox(this.parentHighlightBox, highlightEl.parentElement);
                // if (highlightEl.parentElement.parentElement) {
                //     this.showBox(this.grandParentHighlightBox, highlightEl.parentElement.parentElement);
                // } else this.grandParentHighlightBox.style.display = 'none';
            } else this.parentHighlightBox.style.display = 'none';
        });


        onEvent(this._rootEl, ['click'], '*', (event: MouseEvent) => {
            if (this._disabled) return;
            event.preventDefault();
            if (this.wysiwygEditor.isActive && this.selectedEl && 
                (this.selectedEl == event.target || this.selectedEl.contains(event.target as HTMLElement))) return;
            this.selectedEl = event.target as HTMLElement;
            this.showBox(this.selectedBox, this.selectedEl);
            this.toggleWysiwygEditor(false);
            emit(this, {type: "FrmdbSelectPageElement", el: this.selectedEl});
        });

        onEventChildren(this.selectedBox, ['click'], '[data-frmdb-action="edit"]', (event) => {
            if (this._disabled) return;
            event.preventDefault();
            if (!this.selectedEl || !isElementWithTextContentEditable(this.selectedEl)) return;
            this.toggleWysiwygEditor(true);
            emit(this, {type: "FrmdbEditWysiwygPageElement", el: this.selectedEl});
        });

        onEventChildren(this.selectedBox, ['click'], '[data-frmdb-action]', (event) => {
            if (this._disabled) return;
            event.preventDefault();
            let el: HTMLElement = event.target.closest('[data-frmdb-action]');
            if (!el || !this.selectedEl) return;
            if (el.dataset.frmdbAction === "edit") return;
            emit(this, {type: "FrmdbSelectPageElementAction", el: this.selectedEl, action: el.dataset.frmdbAction as FrmdbSelectPageElementAction['action']});
        });
    }

    selectElement(el: HTMLElement | null) {
        if (el) {
            if (el != this.selectedEl) {
                this.selectedEl = el;
                this.showBox(this.selectedBox, this.selectedEl);
            }
        } else {
            this.selectedBox.style.display = 'none';
        }
    }

    toggleWysiwygEditor(active: boolean) {
        if (this._disabled) return;
        if (!this.selectedEl) return;

        this.selectedBox.classList.toggle('editing', active);

        if (active) this.wysiwygEditor.start(this.selectedEl);
        else this.wysiwygEditor.destroy();
    }

    showBox(box: HTMLElement, highlightEl: HTMLElement) {
        if (!highlightEl.tagName) return;
        if (["frmdb-dom-tree", "frmdb-highlight-box", "body"].includes(highlightEl.tagName.toLowerCase())) {
            box.style.display = 'none';
            return;
        }

        let offset = highlightEl.getBoundingClientRect();
        let height = highlightEl.clientHeight;
        let width = highlightEl.clientWidth;

        let nameEl = box.querySelector('.name');
        if (nameEl) nameEl.innerHTML = highlightEl.tagName + '.' + Array.from(highlightEl.classList).join('.');

        if (offset.top <= 20) box.classList.add('is-at-top')
        else box.classList.remove('is-at-top');

        box.style.display = 'block';
        box.style.top = (offset.top) + 'px';
        box.style.left = (offset.left) + 'px';
        box.style.height = height + 'px';
        box.style.width = width + 'px';
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
