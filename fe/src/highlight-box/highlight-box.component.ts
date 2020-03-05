import * as _ from "lodash";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { getDoc, getSiblingIndex } from "@core/dom-utils";
import { HighlightComponent } from "@fe/highlight/highlight.component";
import { FrmdbCustomRender, dataBindStateToElement } from "@fe/frmdb-element-utils";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

export class State {
    boxes: HighlightComponent[] = [];
    rootEl: HTMLElement | Document | null = null;
    disabled: boolean = false;
    highlightedEl: HTMLElement | null = null;
    selectedEl: HTMLElement | null = null;
}

export class HighlightBoxComponent extends HTMLElement implements FrmdbCustomRender {
    static observedAttributes = ['disabled'];
    state: State = new State();
    selectedBox: HighlightComponent;
    highlightBox: HighlightComponent;

    set disabled(d: boolean) {
        this.setAttribute('disabled', new Boolean(d).toString());
    }

    public enableSelectedActionsEvents: boolean = true;
    public enableAddElementActionsEvents: boolean = false;

    set rootEl(el: HTMLElement) {
        if (el === this.state.rootEl) return;
        this.state.rootEl = el;
        this.selectedBox.rootEl = el;
        this.init();
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style>${HTML}`;
        this.selectedBox = this.shadowRoot!.querySelector('frmdb-highlight#selected-box') as HighlightComponent;
        this.highlightBox = this.shadowRoot!.querySelector('frmdb-highlight#highlight-box') as HighlightComponent;
    }
    

    frmdbRender() {
        this.removeBoxes();
        let el: HTMLElement | null;

        if (this.state.highlightedEl && this.state.selectedEl != this.state.highlightedEl) {
            this.highlightBox.highlightEl = this.state.highlightedEl;
            this.highlightBox.querySelector('.component-name')!.innerHTML = this.getElemName(this.state.highlightedEl);
            this.highlightBox.style.display = 'block';
        } else {
            this.highlightBox.style.display = 'none';
        }
        
        if (this.state.selectedEl) {
            this.selectedBox.highlightEl = this.state.selectedEl;
            this.selectedBox.style.display = 'block';

            el = this.state.selectedEl;
            while (el = el.previousElementSibling as HTMLElement | null) {
                let sidx = getSiblingIndex(el);
                this.addBox(el, "selected", 'previous-sibling', /*html*/`
                    <div slot="actions-bottom">
                        <div class="actions related" onmouseover="event.stopPropagation()">
                            <a class="btn py-0 px-1 rounded" onclick="$FSCMP(this).clickSelectElement(this)" 
                                href="javascript:void(0)" title="Select Sibling ${sidx} Element">
                                <i class="frmdb-i-hand-point-up"></i>
                            </a>
                        </div>
                    </div>
                `);
            }

            el = this.state.selectedEl;
            while (el = el.nextElementSibling as HTMLElement | null) {
                let sidx = getSiblingIndex(el);
                this.addBox(el, "selected", 'next-sibling', /*html*/`
                    <div slot="actions-bottom">
                        <div class="actions related" onmouseover="event.stopPropagation()">
                            <a class=" py-0 px-1 rounded" onclick="$FSCMP(this).clickSelectElement(this)" 
                                href="javascript:void(0)" title="Select Sibling ${sidx} Element">
                                <i class="frmdb-i-hand-point-up"></i>
                            </a>
                        </div>
                    </div>
                `);
            }
            if (el = this.state.selectedEl.parentElement as HTMLElement | null) {
                this.addBox(el, "selected", "parent", /*html*/`
                    <div slot="actions-left">
                        <div class="actions related" onmouseover="event.stopPropagation()">
                            <a class=" py-0 px-1 rounded" onclick="$FSCMP(this).clickSelectElement(this)" 
                                href="javascript:void(0)" title="Select Parent Element">
                                <i class="frmdb-i-hand-point-up"></i>
                            </a>
                        </div>
                    </div>
                `, 2);
            }
            if (el = this.state.selectedEl.parentElement?.parentElement as HTMLElement | null) {
                this.addBox(el, "selected", "grand-parent", /*html*/`
                    <div slot="actions-top-left" class="d-flex flex-nowrap">
                        <div class="actions related" onmouseover="event.stopPropagation()">
                            <a class=" py-0 px-1 rounded" onclick="$FSCMP(this).clickSelectElement(this)" 
                                href="javascript:void(0)" title="Select Grand Parent Element">
                                <i class="frmdb-i-hand-point-up"></i>
                            </a>
                        </div>
                    </div>
                `, 4);
            }
        } else {
            this.selectedBox.style.display = 'none';
        }
    }

    addBox(highlightEl: HTMLElement | null, boxType: "highlighted" | "selected" | "editor", elemType: "focused-element" | "previous-sibling" | "next-sibling" | "parent" | "sibling-of-parent" | "grand-parent", actions: string | null, margin: number = 0, boxTagName = 'frmdb-highlight'): HighlightComponent {
        let box: HighlightComponent = getDoc(this).createElement(boxTagName) as HighlightComponent;

        box.classList.add('box', boxType, elemType);
        box.margin = margin;
        if (actions) {
            box.innerHTML = actions;
        }
        this.shadowRoot!.prepend(box);
        box.highlightEl = highlightEl;
        this.state.boxes.push(box);
        return box;
    }

    removeBoxes() {
        for (let box of this.state.boxes) {
            this.shadowRoot!.removeChild(box);
        }
        this.state.boxes.length = 0;
    }

    attributeChangedCallback(name: any, oldVal: string, newVal: string) {
        if ('root-element' === name) {
            this.state.rootEl = document.querySelector(newVal) as HTMLElement;
            this.selectedBox.rootEl = this.state.rootEl;
            this.init();
        } else if ('disabled' === name) {
            this.state.disabled = (newVal.toLowerCase() == "true");
        }
    }

    init() {
        if (!this.state.rootEl) return;

        onEvent(this.state.rootEl, ['mousemove'], '*', (event) => {
            let targetEl = event.target as HTMLElement;
            if (targetEl === this.state.highlightedEl) return;
            if (this.state.disabled) return;
            if (
                (event.target as HTMLElement)?.hasAttribute('data-frmdb-highlight-ignore')
                || (event.target as HTMLElement)?.closest('[data-frmdb-highlight-ignore]')
            ) return;

            this.state.highlightedEl = targetEl;
            this.frmdbRender();
            emit(this, { type: "FrmdbHoverPageElement", el: targetEl });
        });

        onEvent(this.state.rootEl, ['click'], '*', (event: MouseEvent) => {
            if (this.state.disabled) return;
            if ((event.target as HTMLElement)?.hasAttribute('data-frmdb-highlight-ignore') || (event.target as HTMLElement)?.closest('[data-frmdb-highlight-ignore]')) return;
            event.preventDefault();
            this.selectElement(event.target as HTMLElement);
        });

        this.state.rootEl?.ownerDocument?.addEventListener('scroll', (event) => {
            this.repositionBoxes();
        });
        (this.state.rootEl.ownerDocument || (this.state.rootEl as Document)).defaultView?.addEventListener('resize', (event) => {
            this.repositionBoxes();
        })
    }

    selectElement(targetEl: HTMLElement | null) {
        this.state.selectedEl = targetEl;
        this.frmdbRender();
    }

    allBoxes() {
        return this.state.boxes.concat(this.selectedBox, this.highlightBox);
    }
    repositionBoxes() {
        for (let box of this.allBoxes()) {
            box.render();
        }
    }

    getElemName(el: HTMLElement) {
        return el.tagName + '.' + Array.from(el.classList).join('.');
    }

    clickSelectElement(btn: HTMLElement) {
        let el = (btn.closest('.box') as HighlightComponent)?.highlightEl;
        if (!el) { console.error('Cannot find highlighted elem for ', btn); return }

        this.state.selectedEl = el;
        this.frmdbRender();
    }

}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
