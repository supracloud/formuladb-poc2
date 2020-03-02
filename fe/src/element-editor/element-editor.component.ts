import * as _ from "lodash";
import { onEvent, emit, onEventChildren } from "@fe/delegated-events";
import { isElementWithTextContentEditable } from "@core/i18n-utils";
import { HighlightComponent } from "@fe/highlight/highlight.component";
import { FrmdbCustomRender, dataBindStateToElement } from "@fe/frmdb-element-urils";
import { State as HighlightBoxState, HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { WysiwygEditorComponent } from "@fe/wysiwyg-editor/wysiwyg-editor.component";
import { Undo } from "@fe/frmdb-editor/undo";

class State extends HighlightBoxState {
    wysiwygEditorOn: boolean = false;
    currentCutElement: HTMLElement | null = null;
}

export class ElementEditorComponent extends HighlightBoxComponent implements FrmdbCustomRender {
    static observedAttributes = ['disabled'];
    state: State = dataBindStateToElement(this, new State());
    wysiwygEditor: WysiwygEditorComponent | null;

    set disabled(d: boolean) {
        this.setAttribute('disabled', new Boolean(d).toString());
    }

    public enableSelectedActionsEvents: boolean = true;
    public enableAddElementActionsEvents: boolean = false;

    frmdbRender() {
        super.frmdbRender();
        if (this.state.selectedEl) {
            this.selectedBox.style.display = 'block';
            this.selectedBox.innerHTML = /*html*/`
                <div slot="actions-top">
                    <div class="btn dropdown frmdb-dropdown-hover" title="Move Element">
                        <span class=component-name>${this.getElemName(this.state.selectedEl)}</span> <i class="frmdb-i-ellipsis-v"></i>
                        <div class="dropdown-menu dropdown-menu-right px-2 text-nowrap">
                            <a class="btn" data-frmdb-action="move-start" href="javascript:void(0)" title="Move element"><i class="frmdb-i-arrows-alt"></i></a>
                            <a class="btn" onclick="$FCMP(this).editSelectedElement()" href="javascript:void(0)" title="Edit element text"><i class="frmdb-i-edit"></i></a>
                            <a class="btn" data-frmdb-action="copy-start" href="javascript:void(0)" title="Copy element"><i class="frmdb-i-copy"></i></a>
                            <a class="btn" data-frmdb-action="delete" href="javascript:void(0)" title="Remove element"><i class="frmdb-i-trash"></i></a>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.state.selectedEl && this.state.wysiwygEditorOn) {
            this.selectedBox.style.display = 'none';
            this.wysiwygEditor = this.addBox(this.state.selectedEl, "selected", "focused-element", null, 'frmdb-wysiwyg-editor') as WysiwygEditorComponent;
        }
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
    }

    paste(node: HTMLElement, inside: boolean) {
        if (!this.state.currentCutElement) { alert("Please \"clone\" and/or \"cut\" an element before pasting into another location on the page."); return; }
        let oldParent = this.state.currentCutElement.parentElement!;
        let oldNextSibling = this.state.currentCutElement.nextElementSibling;

        if (inside) {
            node.appendChild(this.state.currentCutElement);
        } else {
            let p = node.parentElement;
            if (p) {
                p.insertBefore(this.state.currentCutElement, node.nextSibling);
            }
        }

        Undo.addMutation({
            type: 'move',
            target: this.state.currentCutElement,
            oldParent: oldParent,
            newParent: this.state.currentCutElement.parentElement!,
            oldNextSibling: oldNextSibling,
            newNextSibling: this.state.currentCutElement.nextElementSibling,
        });

        this.selectElement(this.state.currentCutElement);
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
