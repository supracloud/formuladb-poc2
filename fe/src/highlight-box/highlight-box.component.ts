import * as _ from "lodash";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { WysiwygEditor } from "./wysiwyg-editor";
import { FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { isElementWithTextContentEditable } from "@core/i18n-utils";
import { getDoc } from "@core/dom-utils";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

interface HighlightBoxElement extends HTMLDivElement {
    $frmdbHighlightedEl$: HTMLElement;
}

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    _disabled: boolean = false;
    highlightEl: HTMLElement | undefined;
    highlightBox: HighlightBoxElement;
    relatedHighlightBoxes: HighlightBoxElement[] = [];
    selectedBox: HighlightBoxElement;
    relatedSelectBoxes: HighlightBoxElement[] = [];
    selectedEl: HTMLElement | undefined;
    static observedAttributes = ['disabled'];
    wysiwygEditor = new WysiwygEditor();

    set disabled(d: boolean) {
        this.setAttribute('disabled', new Boolean(d).toString());
    }

    public enableSelectedActionsEvents: boolean = true;
    public enableAddElementActionsEvents: boolean = false;

    set rootEl(el: HTMLElement | Document) {
        this._rootEl = el;
        this.init();
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style>${HTML}`;
        this.highlightBox = this.shadowRoot!.querySelector('#highlight') as HighlightBoxElement;
        this.selectedBox = this.shadowRoot!.querySelector('#selected') as HighlightBoxElement;
    }

    addBox(highlightEl: HTMLElement, className: string, isSelected?: boolean): HighlightBoxElement {
        let box: HighlightBoxElement = getDoc(this).createElement('div') as HighlightBoxElement;
        box.classList.add('box', className);
        if (isSelected) {
            box.innerHTML = /*html*/`
                <div class="actions related">
                    <a class="btn" data-frmdb-action="choose" href="javascript:void(0)" title="Select Element"><i class="frmdb-i-hand-point-up"></i></a>
                </div>
            `;
        }
        this.shadowRoot!.appendChild(box);
        box.$frmdbHighlightedEl$ = highlightEl;
        this.positionBox(box, highlightEl);

        return box;
    }
    removeBoxes(boxes: HTMLElement[]) {
        for (let box of boxes) {
            this.shadowRoot!.removeChild(box);
        }
        boxes.length = 0;
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
            if ((event.target as HTMLElement)?.hasAttribute('data-frmdb-highlight-ignore') || (event.target as HTMLElement)?.closest('[data-frmdb-highlight-ignore]')) return;
            // event.preventDefault();
            this.highlightEl = event.target as HTMLElement;
            this.highlightElement(this.highlightEl);
            emit(this, { type: "FrmdbHoverPageElement", el: this.highlightEl });
        });


        onEvent(this._rootEl, ['click'], '*', (event: MouseEvent) => {
            if (this._disabled) return;
            if ((event.target as HTMLElement)?.hasAttribute('data-frmdb-highlight-ignore') || (event.target as HTMLElement)?.closest('[data-frmdb-highlight-ignore]')) return;
            event.preventDefault();
            if (this.wysiwygEditor.isActive && this.selectedEl &&
                (this.selectedEl == event.target || this.selectedEl.contains(event.target as HTMLElement))) return;
            console.warn((event.target as any).outerHTML);
            this.selectElement(event.target as HTMLElement);
            this.selectedEl = event.target as HTMLElement;
            this.showSelectBox(this.selectedEl);
            this.toggleWysiwygEditor(false);
            emit(this, { type: "FrmdbSelectPageElement", el: this.selectedEl });
        });

        onEventChildren(this.selectedBox, ['mouseover'], '.actions [data-frmdb-action], .actions .dropdown', (event) => {
            this.highlightBox.style.display = 'none';
            for (let hbox of this.relatedHighlightBoxes) {
                this.shadowRoot!
            }
            this.removeBoxes(this.relatedHighlightBoxes);
        });


        if (this.enableSelectedActionsEvents) {
            this.enableSelectedActionsEvents = false;

            onEventChildren(this.selectedBox, ['click'], '.actions.selected [data-frmdb-action]', (event) => {
                if (this._disabled) return;
                event.preventDefault();
                let el: HTMLElement = event.target.closest('[data-frmdb-action]');
                if (!el || !this.selectedEl) return;
                if (el.dataset.frmdbAction === "edit") {
                    if (!this.selectedEl || !isElementWithTextContentEditable(this.selectedEl)) return;
                    this.toggleWysiwygEditor(true);
                    emit(this, { type: "FrmdbEditWysiwygPageElement", el: this.selectedEl });
                } else if (el.dataset.frmdbAction === "choose") {
                } else {
                    if (el.dataset.frmdbAction === "cut") {
                        this.selectedBox.style.transition = "background-color 1s";
                        this.selectedBox.style.backgroundColor = "rgba(61, 131, 253, 0.75)";
                        setTimeout(() => {
                            this.selectedBox.style.transition = "background-color 1s";
                            this.selectedBox.style.backgroundColor = "rgba(61, 131, 253, 0.25)";
                        }, 1000);
                    }
                    emit(this, { type: "FrmdbSelectPageElementAction", el: this.selectedEl, action: el.dataset.frmdbAction as FrmdbSelectPageElementAction['action'] });
                }
            });
        }

        if (this.enableAddElementActionsEvents) {
            this.enableAddElementActionsEvents = false;
            this.selectedBox.classList.add('add-elements');

            onEventChildren(this.selectedBox, ['click'], '.actions.add-elements [data-frmdb-action]', (event) => {
                if (this._disabled) return;
                event.preventDefault();
                let el: HTMLElement = event.target.closest('[data-frmdb-action]');
                if (!el || !this.selectedEl) return;
                if (el.dataset.frmdbAction === "parent") {
                    this.selectElement(this.selectedEl.parentElement);
                } else if (el.dataset.frmdbAction === "prev") {
                    this.selectElement(this.selectedEl.previousElementSibling as HTMLElement | null);
                } else if (el.dataset.frmdbAction === "choose") {
                    emit(this, { type: "FrmdbChoosePageElement", el: this.selectedEl });
                }
            });
        }

        this._rootEl.addEventListener('scroll', (event) => {
            this.repositionBoxes();
        });
        (this._rootEl.ownerDocument || (this._rootEl as Document)).defaultView!.addEventListener('resize', (event) => {
            this.repositionBoxes();
        })
    }

    highlightSiblings(highlightEl: HTMLElement, className: string) {
        let el: HTMLElement | null;

        el = highlightEl.previousElementSibling as HTMLElement | null;
        while (el) {
            let box = this.addBox(el, className);
            this.relatedHighlightBoxes.push(box);
            el = el.previousElementSibling as HTMLElement | null;
        }

        el = highlightEl.nextElementSibling as HTMLElement | null;
        while (el) {
            let box = this.addBox(el, className);
            this.relatedHighlightBoxes.push(box);
            el = el.nextElementSibling as HTMLElement | null;
        }
    }

    selectSiblings(selectedEl: HTMLElement, className: string) {
        let el: HTMLElement | null;

        el = selectedEl.previousElementSibling as HTMLElement | null;
        while (el) {
            let box = this.addBox(el, className, true);
            this.relatedSelectBoxes.push(box);
            el = el.previousElementSibling as HTMLElement | null;
        }

        el = selectedEl.nextElementSibling as HTMLElement | null;
        while (el) {
            let box = this.addBox(el, className, true);
            this.relatedSelectBoxes.push(box);
            el = el.nextElementSibling as HTMLElement | null;
        }
    }

    highlightElement(highlightEl: HTMLElement) {
        this.removeBoxes(this.relatedHighlightBoxes);
        this.showBox(this.highlightBox, highlightEl);
        this.highlightSiblings(highlightEl, 'sibling-highlight');

        let el: HTMLElement | null;
        el = highlightEl.parentElement as HTMLElement | null;
        if (el) {
            let box = this.addBox(el, 'parent-highlight');
            this.relatedHighlightBoxes.push(box);
            this.highlightSiblings(el, 'parent-highlight');
        }

        el = highlightEl.parentElement?.parentElement as HTMLElement | null;
        if (el) {
            let box = this.addBox(el, 'grand-parent-highlight');
            this.relatedHighlightBoxes.push(box);
        }
    }

    showSelectBox(selectedEl: HTMLElement) {
        this.selectedEl = selectedEl;
        this.removeBoxes(this.relatedSelectBoxes);
        this.showBox(this.selectedBox, selectedEl);
        this.selectSiblings(selectedEl, 'sibling-selected');

        let el: HTMLElement | null;
        el = selectedEl.parentElement as HTMLElement | null;
        if (el) {
            let box = this.addBox(el, 'parent-selected', true);
            this.relatedSelectBoxes.push(box);
            this.selectSiblings(el, 'parent-selected');
        }

        el = selectedEl.parentElement?.parentElement as HTMLElement | null;
        if (el) {
            let box = this.addBox(el, 'grand-parent-selected', true);
            this.relatedSelectBoxes.push(box);
        }
    }
    selectElement(el: HTMLElement | null) {
        this.removeBoxes(this.relatedSelectBoxes);
        if (el) {
            this.showSelectBox(el);
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

    showBox(box: HighlightBoxElement, highlightEl: HTMLElement) {
        if (!highlightEl.tagName) return;
        if (["frmdb-dom-tree", "frmdb-highlight-box", "body"].includes(highlightEl.tagName.toLowerCase())) {
            box.style.display = 'none';
            return;
        }

        let grandParentElName = '', parentElName = '', elName = this.getElName(highlightEl);
        if (highlightEl.parentElement && highlightEl.parentElement.parentElement) grandParentElName = this.getElName(highlightEl.parentElement.parentElement);
        if (highlightEl.parentElement) parentElName = this.getElName(highlightEl.parentElement);

        let grandParentNameEl = box.querySelector('.name > .grand-parent');
        if (grandParentNameEl) {
            if (grandParentElName && (grandParentElName + parentElName + elName).length < 75) grandParentNameEl.innerHTML = grandParentElName;
            else grandParentNameEl.innerHTML = '';
        }
        let parentNameEl = box.querySelector('.name > .parent');
        if (parentNameEl) {
            if (parentElName) parentNameEl.innerHTML = parentElName;
            else parentNameEl.innerHTML = '';
        }
        let nameEl = box.querySelector('.name > .elem');
        if (nameEl) nameEl.innerHTML = elName;

        box.$frmdbHighlightedEl$ = highlightEl;
        this.positionBox(box, highlightEl);
    }

    positionBox(box: HTMLElement, highlightEl: HTMLElement) {
        if (!highlightEl.tagName) return;
        let offset = highlightEl.getBoundingClientRect();
        let height = highlightEl.clientHeight;
        let width = highlightEl.clientWidth;

        if (offset.top <= 20) box.classList.add('is-at-top')
        else box.classList.remove('is-at-top');

        box.style.display = 'block';
        box.style.top = (offset.top) + 'px';
        box.style.left = (offset.left) + 'px';
        box.style.height = height + 'px';
        box.style.width = width + 'px';
    }

    repositionBoxes() {
        if (this.highlightEl) {
            this.positionBox(this.highlightBox, this.highlightEl);
            for (let box of this.relatedHighlightBoxes) {
                this.positionBox(box, box.$frmdbHighlightedEl$);
            }
        }
        if (this.selectedEl) {
            this.positionBox(this.selectedBox, this.selectedEl);
            for (let box of this.relatedSelectBoxes) {
                this.positionBox(box, box.$frmdbHighlightedEl$);
            }
        }

    }

    getElName(el: HTMLElement) {
        return el.tagName + '.' + Array.from(el.classList).join('.');
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
