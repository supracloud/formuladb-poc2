import { onEvent } from "@fe/delegated-events";
import { Undo } from "@fe/frmdb-editor/undo";
import { I18N_FE } from "@fe/i18n-fe";

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

		let nodeLanguage = this.elem.getAttribute('data-i18n');
		const nodeValue = this.elem.innerHTML;
		if (!nodeLanguage) {
			nodeLanguage = I18N_FE.getDefaultLanguage().lang;
			this.elem.setAttribute('data-i18n', nodeLanguage);
		}
		I18N_FE.updateNode(this.elem, nodeLanguage, nodeLanguage, this.oldValue, nodeValue);

		Undo.addMutation({
			type: 'characterData',
			target: this.elem,
			oldValue: this.oldValue,
			newValue: nodeValue
		});
		
		this.elem = null;
	}
}
