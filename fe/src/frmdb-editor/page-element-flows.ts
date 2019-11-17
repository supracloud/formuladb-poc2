import { FrmdbEditorDirective } from "./frmdb-editor.directive";
import { onEvent, onEventChildren } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction, FrmdbAddPageElement, FrmdbRemovePageElement } from "@fe/frmdb-user-events";
import { Undo } from "./undo";

export function pageElementFlows(editor: FrmdbEditorDirective) {
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

    onEvent(editor.highlightBox, 'FrmdbSelectPageElement', '*', (event: { detail: FrmdbSelectPageElement }) => {
        editor.selectElement(event.detail.el);
    });
    onEvent(editor.elementEditor, 'FrmdbSelectPageElement', '*', (event: { detail: FrmdbSelectPageElement }) => {
        editor.selectElement(event.detail.el);
    });

    onEvent(editor.highlightBox, 'FrmdbSelectPageElementAction', '*', (event: { detail: FrmdbSelectPageElementAction }) => {
        let action = event.detail.action;
        if (action === "add-after" || action === "add-inside") {
            editor.addElementCmp.start(editor.themeCustomizer.cssFile, event.detail.el, event.detail.action)
        }
        else if (action === "up" || action === "down") {
            let node = event.detail.el;
            let oldParent = node.parentElement!;
            let oldNextSibling = node.nextElementSibling;

            if ("up" == action) {
                let next = node.previousElementSibling;
                if (next) {
                    oldParent.insertBefore(node, next);
                } else {
                    let p = node.parentElement;
                    if (!p || !p.parentElement) { console.warn("parents not found", node, p); return }
                    p.parentElement.insertBefore(node, p);
                }
            } else {
                let next = node.nextElementSibling;
                if (next) {
                    oldParent.insertBefore(node, next.nextElementSibling);
                } else {
                    let p = node.parentElement;
                    if (!p || !p.parentElement) { console.warn("parents not found", node, p); return }
                    p.parentElement.insertBefore(node, p.nextElementSibling);
                }
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
