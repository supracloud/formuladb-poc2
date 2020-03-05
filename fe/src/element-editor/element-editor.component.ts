import * as _ from "lodash";
import { emit } from "@fe/delegated-events";
import { isElementWithTextContentEditable } from "@core/i18n-utils";
import { State as HighlightBoxState, HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { WysiwygEditorComponent } from "@fe/wysiwyg-editor/wysiwyg-editor.component";
import { Undo } from "@fe/frmdb-editor/undo";
import { getDoc } from "@core/dom-utils";

class State extends HighlightBoxState {
    wysiwygEditorOn: boolean = false;
    currentCutElement: HTMLElement | null = null;
    currentCopiedElement: HTMLElement | null = null;
}

export class ElementEditorComponent extends HighlightBoxComponent {
    wysiwygEditor: WysiwygEditorComponent;
    state = new State();

    constructor() {
        super();

        this.wysiwygEditor = getDoc(this).createElement('frmdb-wysiwyg-editor') as WysiwygEditorComponent;
        this.wysiwygEditor.id = 'highlight-box';
        this.wysiwygEditor.style.display = 'none';
        this.shadowRoot!.appendChild(this.wysiwygEditor);
    }

    set disabled(d: boolean) {
        this.setAttribute('disabled', new Boolean(d).toString());
    }

    public enableSelectedActionsEvents: boolean = true;
    public enableAddElementActionsEvents: boolean = false;

    frmdbRender() {

        if (this.state.highlightedEl && (this.state.currentCopiedElement || this.state.currentCutElement)) {
            this.highlightBox.innerHTML = /*html*/`
                <div slot="actions-top">
                    <span class="component-name text-nowrap"></span>
                </div>
                <div slot="actions-middle">
                    <i class="frmdb-i-bullseye"></i>
                </div>
            `;
        } else {
            this.highlightBox.innerHTML = /*html*/`
                <div slot="actions-top">
                    <span class="component-name text-nowrap"></span>
                </div>
            `;
        }

        super.frmdbRender();

        if (this.state.selectedEl) {
            this.selectedBox.style.display = 'block';
            if (this.state.currentCopiedElement || this.state.currentCutElement) {
                this.selectedBox.innerHTML = /*html*/`
                    <div slot="actions-top" class="d-flex flex-nowrap">
                        <a class="btn" onclick="$FSCMP(this).paste(true)" href="javascript:void(0)" title="Inser inside"><i class="frmdb-i-inside-box"></i></a>
                        <a class="btn" onclick="$FSCMP(this).paste(false)" href="javascript:void(0)" title="Insert after"><i class="frmdb-i-after-box"></i></a>
                    </div>
                `;
            } else {
                this.selectedBox.innerHTML = /*html*/`
                    <div slot="actions-top" class="d-flex flex-nowrap">
                        <span class="component-name text-nowrap">${this.getElemName(this.state.selectedEl)}</span>
                        <div class="btn dropdown frmdb-dropdown-hover" title="Edit Element">
                            <i class="pl-1 frmdb-i-ellipsis-v"></i>
                            <div class="dropdown-menu dropdown-menu-right px-2 text-nowrap">
                                <a class="btn" onclick="$FSCMP(this).cutElement()" href="javascript:void(0)" title="Cut/Move element"><i class="frmdb-i-cut"></i></a>
                                <a class="btn" onclick="$FSCMP(this).editSelectedElement()" href="javascript:void(0)" title="Edit element text"><i class="frmdb-i-edit"></i></a>
                                <a class="btn" onclick="$FSCMP(this).copyElement()" href="javascript:void(0)" title="Copy element"><i class="frmdb-i-copy"></i></a>
                                <a class="btn" onclick="$FSCMP(this).deleteElement()" href="javascript:void(0)" title="Remove element"><i class="frmdb-i-trash"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        if (this.state.selectedEl && this.state.wysiwygEditorOn) {
            this.selectedBox.style.display = 'none';
            this.wysiwygEditor.highlightEl = this.state.selectedEl;
        }

        if (this.wysiwygEditor.isActive && !this.state.wysiwygEditorOn) {
            this.wysiwygEditor.highlightEl = null;
        }
    }

    allBoxes() {
        return super.allBoxes().concat(this.wysiwygEditor);
    }

    selectElement(targetEl: HTMLElement | null) {
        if (this.state.wysiwygEditorOn && this.state.selectedEl &&
            (this.state.selectedEl == targetEl || this.state.selectedEl.contains(targetEl))) return;

        this.state.wysiwygEditorOn = false;
        super.selectElement(targetEl);
        if (targetEl) emit(this, { type: "FrmdbSelectPageElement", el: targetEl });
    }

    editSelectedElement() {
        if (!this.state.selectedEl) return;
        if (isElementWithTextContentEditable(this.state.selectedEl)) {
            this.state.wysiwygEditorOn = true;
            this.frmdbRender();
        }
    }

    moveSelectedElement() {
        if (!this.state.selectedEl) return;

    }

    deleteElement() {
        if (!this.state.selectedEl) return;

        let node = this.state.selectedEl;
        if (!node.parentElement) return;

        Undo.addMutation({
            type: 'childList',
            target: node.parentElement!,
            removedNodes: [node],
            nextSibling: node.nextElementSibling
        });

        let parent = node.parentElement! as HTMLElement;
        parent.removeChild(node);
        this.selectElement(parent);
    }

    cutElement() {
        if (!this.state.selectedEl) return;
        this.state.currentCutElement = this.state.selectedEl;
        this.state.selectedEl = null;
        this.frmdbRender();
    }
    copyElement() {
        if (!this.state.selectedEl) return;
        this.state.currentCopiedElement = this.state.selectedEl;
        this.state.selectedEl = null;
        this.frmdbRender();
    }

    cancelPaste() {
        this.state.currentCopiedElement = null;
        this.state.currentCutElement = null;
        this.frmdbRender();
    }

    paste(inside: boolean) {
        if (!this.state.selectedEl) return;

        let newElement: Element, oldParent: Element | null, oldNextSibling: Element | null;
        let node = this.state.selectedEl;
        if (this.state.currentCutElement) {
            oldParent = this.state.currentCutElement?.parentElement;
            oldNextSibling = this.state.currentCutElement?.nextElementSibling;
            newElement = this.state.currentCutElement;
        } 
        else if (this.state.currentCopiedElement) {
            newElement = getDoc(node).importNode(this.state.currentCopiedElement, true);
            oldParent = null;
            oldNextSibling = null;
        }
        else {alert("Please \"clone\" and/or \"cut\" an element before pasting into another location on the page."); return; }

        if (inside) {
            node.appendChild(newElement);
        } else {
            let p = node.parentElement;
            if (p) {
                p.insertBefore(newElement, node.nextSibling);
            }
        }

        if (null == oldParent) {
            Undo.addMutation({
                type: 'childList',
                target: newElement.parentElement!,
                addedNodes: [newElement],
                nextSibling: newElement.nextElementSibling
            });
        } else {
            Undo.addMutation({
                type: 'move',
                target: newElement,
                oldParent: oldParent,
                newParent: newElement.parentElement!,
                oldNextSibling: oldNextSibling,
                newNextSibling: newElement.nextElementSibling,
            });
        }

        this.selectElement(newElement as HTMLElement);
        this.state.currentCopiedElement = null;
        this.state.currentCutElement = null;
    }

    cloneElement() {
        if (!this.state.selectedEl) return;

        this.state.selectedEl.insertAdjacentHTML('afterend', this.state.selectedEl.outerHTML);
        let node = this.state.selectedEl.nextElementSibling as HTMLElement;

        Undo.addMutation({
            type: 'childList',
            target: node.parentElement!,
            addedNodes: [node],
            nextSibling: node.nextElementSibling
        });
    }
}

customElements.define('frmdb-element-editor', ElementEditorComponent);
