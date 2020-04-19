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
        this.wysiwygEditor.id = 'wysiwyg-editor-box';
        this.wysiwygEditor.style.display = 'none';
        this.shadowRoot!.appendChild(this.wysiwygEditor);
    }

    public enableSelectedActionsEvents: boolean = true;
    public enableAddElementActionsEvents: boolean = false;

    frmdbRender() {

        if (this.state.disabled) {
            this.wysiwygEditor.style.display = 'none';
            super.frmdbRender();
            return;
        }

        if (this.state.highlightedEl && (this.state.currentCopiedElement || this.state.currentCutElement)) {
            this.highlightBox.innerHTML = /*html*/`
                <div slot="actions-top">
                    <span class="component-name text-nowrap"></span>
                </div>
                <div slot="actions-middle">
                    <i class="frmdb-i-bullseye" title="Paste Before/Inside/After this Element" onclick="$FSCMP(this).clickSelectElement(this)" ></i>
                </div>
            `;
            this.highlightBox.style.backgroundColor = 'rgba(61, 133, 253, 0.25)';
        } else {
            this.highlightBox.innerHTML = /*html*/`
                <div slot="actions-top">
                    <span class="component-name text-nowrap"></span>
                </div>
            `;
            this.highlightBox.style.backgroundColor = '';
        }

        super.frmdbRender();

        if (this.state.selectedEl) {
            this.selectedBox.style.display = 'block';
            if (this.state.currentCopiedElement || this.state.currentCutElement) {
                this.selectedBox.innerHTML = /*html*/`
                    <div slot="actions-top-right" class="d-flex flex-nowrap">
                        <a class="btn" onclick="$FSCMP(this).paste('before')" href="javascript:void(0)" title="Insert before"><i class="frmdb-i-before-box"></i></a>
                        <a class="btn" onclick="$FSCMP(this).paste('inside')" href="javascript:void(0)" title="Insert inside"><i class="frmdb-i-inside-box"></i></a>
                        <a class="btn" onclick="$FSCMP(this).paste('after')" href="javascript:void(0)" title="Insert after"><i class="frmdb-i-after-box"></i></a>
                        <a class="btn" onclick="$FSCMP(this).paste('cancel')" href="javascript:void(0)" title="Cancel"><i class="frmdb-i-window-close"></i></a>
                    </div>
                `;
            } else {
                let editTextBtn = `class="btn" onclick="$FSCMP(this).editSelectedElement()" title="Edit element text"`;
                if (!isElementWithTextContentEditable(this.state.selectedEl)) {
                    editTextBtn = `class="btn disabled" title="Complex elements cannot use the plain text editor"`
                } else if (this.state.selectedEl.hasAttribute('data-frmdb-value')) {
                    editTextBtn = `class="btn disabled" title="Cannot edit text, value from data ${this.state.selectedEl.getAttribute('data-frmdb-value')}. Please edit the table data instead."`
                }
                this.selectedBox.innerHTML = /*html*/`
                    <div slot="actions-top" class="d-flex flex-nowrap">
                        <div class="btn dropdown py-0 frmdb-dropdown-hover">
                            <i class="frmdb-i-edit" title="Edit Element"></i>
                            <div class="dropdown-menu p-0 m-0 text-nowrap">
                                <a class="btn" onclick="$FSCMP(this).cutElement()" href="javascript:void(0)" title="Cut/Move element"><i class="frmdb-i-cut"></i></a>
                                <a ${editTextBtn} href="javascript:void(0)"><i class="frmdb-i-pen-fancy"></i></a>
                                <a class="btn" onclick="$FSCMP(this).copyElement()" href="javascript:void(0)" title="Copy element"><i class="frmdb-i-copy"></i></a>
                                <a class="btn" onclick="$FSCMP(this).deleteElement()" href="javascript:void(0)" title="Remove element"><i class="frmdb-i-trash"></i></a>
                            </div>
                        </div>
                        <div class="btn dropdown py-0 frmdb-dropdown-hover">
                            <i class="frmdb-i-hand-point-up" title="Select Overlapping Element"></i>
                            <div class="dropdown-menu p-0 m-0 text-nowrap">
                                <a class="btn" onmouseenter="$FSCMP(this).hP()" onmouseleave="$FSCMP(this).uhP()" onclick="$FSCMP(this).sP()"
                                    href="javascript:void(0)" title="Select Parent Element"><i class="frmdb-i-hand-point-up"></i></a>
                                <a class="btn" onmouseenter="$FSCMP(this).hGP()" onmouseleave="$FSCMP(this).uhGP()" onclick="$FSCMP(this).sGP()"
                                    href="javascript:void(0)" title="Select Grand Parent Element">
                                    <i class="frmdb-i-hand-point-up" style="display: inline-block; transform: translate(0,25%) scale(0.7)"></i><i class="frmdb-i-hand-point-up" style="margin-left: -0.25em; display: inline-block; transform: scale(0.7)"></i>
                            </div>
                        </a>                        
                        <!--<div class="btn dropdown frmdb-dropdown-hover">
                            <i class="frmdb-i-0000116-arrows-alt" title="Move Element"></i>
                            <div class="dropdown-menu px-2 text-nowrap">
                                <a class="btn" data-frmdb-action="move-before" href="javascript:void(0)" style="transform: rotate(-90deg);" title="Move element before previous sibling"><i class="frmdb-i-arrow-up"></i></a>
                                <a class="btn" data-frmdb-action="move-after" href="javascript:void(0)" style="transform: rotate(90deg);" title="Move element before previous sibling"><i class="frmdb-i-arrow-up"></i></a>
                                <a class="btn" data-frmdb-action="move-up" href="javascript:void(0)" title="Move element up, before parent element"><i class="frmdb-i-arrow-up"></i></a>
                                <a class="btn" data-frmdb-action="move-down" href="javascript:void(0)" title="Move element down, inside next sibling"><i class="frmdb-i-arrow-down"></i></a>
                            </div>
                        </div>-->
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
    addElement(el: HTMLElement) {
        this.state.currentCopiedElement = el;
        this.state.selectedEl = null;
        this.frmdbRender();
    }

    cancelPaste() {
        this.state.currentCopiedElement = null;
        this.state.currentCutElement = null;
        this.frmdbRender();
    }

    paste(position: 'before' | 'inside' | 'after' | 'cancel') {
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
        if ('cancel' === position) {
            this.state.currentCopiedElement = null;
            this.state.currentCutElement = null;    
        } else if ('before' == position) {
            let p = node.parentElement;
            if (p) {
                p.insertBefore(newElement, node);
            }
        } else if ('inside' == position) {
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
