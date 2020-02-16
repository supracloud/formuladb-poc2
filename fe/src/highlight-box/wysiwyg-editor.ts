import { onEvent } from "@fe/delegated-events";
import { Undo } from "@fe/frmdb-editor/undo";

declare var $: null, jQuery: null;

export class WysiwygEditor {

	oldValue: string = '';
	elem: HTMLElement | null = null;
	private doc: Document | null = null;

	init(doc: Document, actions: HTMLElement) {
		this.doc = doc;

		onEvent(actions, "click", "#bold-btn, #bold-btn *",  (e) => {
			doc.execCommand('bold', false, undefined);
			e.preventDefault();
			return false;
		});

		onEvent(actions, "click", "#italic-btn, #italic-btn *",  (e) => {
			doc.execCommand('italic', false, undefined);
			e.preventDefault();
			return false;
		});

		onEvent(actions, "click", "#underline-btn, #underline-btn *",  (e) => {
			doc.execCommand('underline', false, undefined);
			e.preventDefault();
			return false;
		});

		onEvent(actions, "click", "#strike-btn, #strike-btn *",  (e) => {
			doc.execCommand('strikeThrough', false, undefined);
			e.preventDefault();
			return false;
		});

		onEvent(actions, "click", "#link-btn, #link-btn *",  (e) => {
			doc.execCommand('createLink', false, "#");
			e.preventDefault();
			return false;
		});
	}

	undo() {
		if (!this.doc) return;
		this.doc.execCommand('undo', false, undefined);
    }

	redo() {
		if (!this.doc) return;
		this.doc.execCommand('redo', false, undefined);
    }

	get isActive() { return this.elem != null; }
	start(elem: HTMLElement) {
		this.elem = elem;
		this.oldValue = elem.innerHTML;
		elem.setAttribute('contenteditable', 'true');
		elem.setAttribute('spellcheckker', 'false');

	}
	destroy() {
		if (!this.elem) return;
		this.elem.removeAttribute('contenteditable');
		this.elem.removeAttribute('spellcheckker');

		const nodeValue = this.elem.innerHTML;

		Undo.addMutation({
			type: 'characterData',
			target: this.elem,
			oldValue: this.oldValue,
			newValue: nodeValue
		});
		
		this.elem = null;
	}
}
