import { FrmdbEditorDirective } from "./frmdb-editor.directive";
import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction, FrmdbAddPageElement, FrmdbRemovePageElement } from "@fe/frmdb-user-events";
import { Undo } from "./undo";
import { ImageInput } from "@fe/component-editor/inputs";
import { ImagePropertyListener } from "./img-editor.component";

let isInitialized: boolean = false;
let currentCutElement: HTMLElement | null = null;
export function pageElementFlows(editor: FrmdbEditorDirective) {
    if (isInitialized) return;
    isInitialized = true;
    
    onEventChildren(document.body, 'click', '#undo-btn', (event) => {
        event.preventDefault();

        if (editor.highlightBox.wysiwygEditor.isActive) {
            editor.highlightBox.wysiwygEditor.undo();
        } else {
            Undo.undo();
            editor.selectElement(null);
        }
    });
    onEventChildren(document.body, 'click', '#redo-btn', (event) => {
        event.preventDefault();

        if (editor.highlightBox.wysiwygEditor.isActive) {
            editor.highlightBox.wysiwygEditor.redo();
        } else {
            Undo.redo();
            editor.selectElement(null);
        }
    });

    onEventChildren(document.body, 'click', '#frmdb-chose-image-button', (event) => {
        let prop: ImageInput | null = event.target.closest('frmdb-image-input');
        if (prop) {
            let listener: ImagePropertyListener = {
                setImgSrc: (src: string) => {
                    if (!prop) return;
                    prop.setValue(src);
                    prop.emitChange();
                },
                setBlob: async (name: string, blob: Blob) => {
                    if (!prop) return;
                    let frmdbBlob = prop.setBlob(name, blob);
                    return frmdbBlob.url;
                },
            };
            editor.imgEditorCmp.start(listener);
        }
    });

    onEventChildren(document.body, 'click', '#frmdb-chose-icon-button', (event) => {
        let prop: ImageInput | null = event.target.closest('frmdb-icon-input');
        if (prop) {
            editor.iconEditorCmp.start(prop);
        }
    });

    onEvent(editor.highlightBox, 'FrmdbSelectPageElement', '*', (event: { detail: FrmdbSelectPageElement }) => {
        console.warn("FrmdbSelectPageElement");
        editor.selectElement(event.detail.el);
    });
    onEvent(editor.elementEditor, 'FrmdbSelectPageElement', '*', (event: { detail: FrmdbSelectPageElement }) => {
        editor.selectElement(event.detail.el);
    });

    onEvent(editor.highlightBox, 'FrmdbSelectPageElementAction', '*', (event: { detail: FrmdbSelectPageElementAction }) => {
        let action = event.detail.action;
        if (action === "add-after" || action === "add-inside") {
            editor.addElementCmp.start(editor.themeCustomizer.cssFile, editor.frameDoc.body.getAttribute('data-frmdb-theme') || 'NoTheme', event.detail.el, event.detail.action)
        }
        else if (action === "paste-after" || action === "paste-inside") {
            if (!currentCutElement) { alert("Please \"clone\" and/or \"cut\" an element before pasting into another location on the page."); return;}
            let node = event.detail.el;
            let oldParent = currentCutElement.parentElement!;
            let oldNextSibling = currentCutElement.nextElementSibling;

            if (action === 'paste-inside') {
                node.appendChild(currentCutElement);
            } else if (action === 'paste-after') {
                let p = node.parentElement;
                if (p) {
                    p.insertBefore(currentCutElement, node.nextSibling);
                }
            }
            Undo.addMutation({
                type: 'move',
                target: currentCutElement,
                oldParent: oldParent,
                newParent: currentCutElement.parentElement!,
                oldNextSibling: oldNextSibling,
                newNextSibling: currentCutElement.nextElementSibling,
            });
            editor.selectElement(currentCutElement);
        }
        else if (action === "move-before" || action === "move-up" || action === "move-down") {
            let node = event.detail.el;
            let oldParent = node.parentElement!;
            let oldNextSibling = node.nextElementSibling;

            if ("move-before" == action) {
                let next = node.previousElementSibling;
                if (next) {
                    oldParent.insertBefore(node, next);
                } else alert("Selected Page Element is already the first element.")
            } else if ("move-up" == action) {
                let p = node.parentElement;
                if (!p || !p.parentElement) alert("Selected Page Element does not have a parent");
                else p.parentElement.insertBefore(node, p);
            } else if ("move-down" == action) {
                let next = node.nextElementSibling;
                if (next) {
                    next.appendChild(node);
                } else alert("Selected Page Element cannot be moved inside a non-existent sibling.")
            }

            Undo.addMutation({
                type: 'move',
                target: node,
                oldParent: oldParent,
                newParent: node.parentElement!,
                oldNextSibling: oldNextSibling,
                newNextSibling: node.nextElementSibling,
            });
            editor.selectElement(node);
        }
        else if (event.detail.action === "cut") {
            currentCutElement = event.detail.el;
        }
        else if (event.detail.action === "clone") {

            event.detail.el.insertAdjacentHTML('afterend', event.detail.el.outerHTML);
            let node = event.detail.el.nextElementSibling as HTMLElement;
            editor.selectElement(node);

            Undo.addMutation({
                type: 'childList',
                target: node.parentElement!,
                addedNodes: [node],
                nextSibling: node.nextElementSibling
            });
        }
        else if (action === "delete") {

            if (confirm("Please confirm! Deletion the selected page element ?")) {

                let node = event.detail.el;

                Undo.addMutation({
                    type: 'childList',
                    target: node.parentElement!,
                    removedNodes: [node],
                    nextSibling: node.nextElementSibling
                });

                node.parentNode!.removeChild(node);
                editor.selectElement(null);
            }
        }
        else if (action === "parent") {
            if (event.detail.el.parentElement) editor.selectElement(event.detail.el.parentElement);
        }
        else if (action === "prev") {
            if (event.detail.el.previousElementSibling) editor.selectElement(event.detail.el.previousElementSibling as HTMLElement);
        }
    });

    editor.frameDoc.addEventListener("FrmdbAddPageElement" as any, (event: {detail: FrmdbAddPageElement}) => {
        let detail: FrmdbAddPageElement = event.detail;
        let node = detail.el;
        if (!node) return;
        Undo.addMutation({
            type: 'childList',
            target: node.parentElement!,
            addedNodes: [node],
            nextSibling: node.nextElementSibling
        });
        editor.selectElement(node);
    });

    editor.frameDoc.addEventListener("FrmdbRemovePageElement" as any, (event: {detail: FrmdbRemovePageElement}) => {
        let detail: FrmdbRemovePageElement = event.detail;
        let node = detail.el;
        if (!node) return;
        Undo.addMutation({
            type: 'childList',
            target: node.parentElement!,
            removedNodes: [node],
            nextSibling: node.nextElementSibling
        });
    });
}
