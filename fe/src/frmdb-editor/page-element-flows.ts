import { FrmdbEditorDirective } from "./frmdb-editor.directive";
import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbAddPageElement, FrmdbRemovePageElement } from "@fe/frmdb-user-events";
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

        if (editor.elementEditor?.wysiwygEditor?.isActive) {
            editor.elementEditor.wysiwygEditor.undo();
        } else {
            Undo.undo();
            editor.selectElement(null);
        }
    });
    onEventChildren(document.body, 'click', '#redo-btn', (event) => {
        event.preventDefault();

        if (editor.elementEditor?.wysiwygEditor?.isActive) {
            editor.elementEditor.wysiwygEditor.redo();
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

    onEvent(editor.elementEditor, 'FrmdbSelectPageElement', '*', (event: CustomEvent<FrmdbSelectPageElement>) => {
        console.warn("FrmdbSelectPageElement");
        editor.selectElement(event.detail.el);
    });
    onEvent(editor.componentEditor, 'FrmdbSelectPageElement', '*', (event: CustomEvent<FrmdbSelectPageElement>) => {
        editor.selectElement(event.detail.el);
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
