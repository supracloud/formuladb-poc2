import * as _ from "lodash";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { WysiwygEditor } from "./wysiwyg-editor";
import { FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { isElementWithTextContentEditable } from "@core/i18n-utils";

const HTML: string = require('raw-loader!@fe-assets/highlight-box/highlight-box.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/highlight-box/highlight-box.component.scss').default;

export class HighlightBoxComponent extends HTMLElement {
    _rootEl: HTMLElement | Document | undefined;
    _disabled: boolean = false;
    highlightEl: HTMLElement | undefined;
    highlightBox: HTMLElement;
    prevHighlightBox: HTMLElement;
    parentHighlightBox: HTMLElement;
    grandParentHighlightBox: HTMLElement;
    selectedBox: HTMLElement;
    parentSelectedBox: HTMLElement;
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
        this.highlightBox = this.shadowRoot!.querySelector('#highlight') as HTMLElement;
        this.prevHighlightBox = this.shadowRoot!.querySelector('#prev-highlight') as HTMLElement;
        this.parentHighlightBox = this.shadowRoot!.querySelector('#parent-highlight') as HTMLElement;
        this.grandParentHighlightBox = this.shadowRoot!.querySelector('#grand-parent-highlight') as HTMLElement;
        this.selectedBox = this.shadowRoot!.querySelector('#selected') as HTMLElement;
        this.parentSelectedBox = this.shadowRoot!.querySelector('#parent-selected') as HTMLElement;
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
            this.parentHighlightBox.style.display = 'none';
            this.grandParentHighlightBox.style.display = 'none';
            this.prevHighlightBox.style.display = 'none';
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

    highlightElement(highlightEl: HTMLElement) {
        this.showBox(this.highlightBox, highlightEl);
        if (highlightEl.parentElement) {
            this.showBox(this.parentHighlightBox, highlightEl.parentElement);
            if (highlightEl.parentElement.parentElement) {
                this.showBox(this.grandParentHighlightBox, highlightEl.parentElement.parentElement);
            } else this.grandParentHighlightBox.style.display = 'none';
        } else this.parentHighlightBox.style.display = 'none';
        if (highlightEl.previousElementSibling) {
            this.showBox(this.prevHighlightBox, highlightEl.previousElementSibling as HTMLElement);
        } else this.prevHighlightBox.style.display = 'none';
    }

    showSelectBox(el: HTMLElement) {
        this.selectedEl = el;
        this.showBox(this.selectedBox, this.selectedEl);
        // if (this.selectedEl.parentElement) {
        //     this.showBox(this.parentSelectedBox, this.selectedEl.parentElement);
        // } else this.parentSelectedBox.style.display = 'none';
    }
    selectElement(el: HTMLElement | null) {
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

    showBox(box: HTMLElement, highlightEl: HTMLElement) {
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
            if (this.highlightEl.parentElement) {
                this.positionBox(this.parentHighlightBox, this.highlightEl.parentElement);
                if (this.highlightEl.parentElement.parentElement) {
                    this.positionBox(this.grandParentHighlightBox, this.highlightEl.parentElement.parentElement);
                }
            }
            if (this.highlightEl.previousElementSibling) {
                this.positionBox(this.prevHighlightBox, this.highlightEl.previousElementSibling as HTMLElement);
            }
        }
        if (this.selectedEl) {
            this.positionBox(this.selectedBox, this.selectedEl);
            // if (this.selectedEl.parentElement) this.positionBox(this.parentSelectedBox, this.selectedEl.parentElement);
        }

    }

    getElName(el: HTMLElement) {
        return el.tagName + '.' + Array.from(el.classList).join('.');
    }
}

customElements.define('frmdb-highlight-box', HighlightBoxComponent);
