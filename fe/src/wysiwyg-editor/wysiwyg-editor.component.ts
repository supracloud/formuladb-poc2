import { onEvent } from "@fe/delegated-events";
import { Undo } from "@fe/frmdb-editor/undo";
import { HighlightComponent } from "@fe/highlight/highlight.component";

declare var $: null, jQuery: null;

const HTML: string = require('raw-loader!@fe-assets/wysiwyg-editor/wysiwyg-editor.component.html').default;

export class WysiwygEditorComponent extends HighlightComponent {

	oldValue: string = '';
	private doc: Document | null = null;

	set highlightEl(el: HTMLElement | null) {
		super.highlightEl = el;
		this.start();
	}

	connectedCallback() {
		this.innerHTML = HTML;
	}

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

	get isActive() { return this.highlightEl != null; }
	start() {
		let elem = this.highlightEl;
		if (!elem) return;
		this.oldValue = elem.innerHTML;
		elem.setAttribute('contenteditable', 'true');
		elem.setAttribute('spellcheckker', 'false');
	}
	
	disconnectedCallback() {
		this.destroy();
	}
	destroy() {
		if (!this.highlightEl) return;
		this.highlightEl.removeAttribute('contenteditable');
		this.highlightEl.removeAttribute('spellchecker');

		const nodeValue = this.highlightEl.innerHTML;

		if (nodeValue != this.oldValue) {
			Undo.addMutation({
				type: 'characterData',
				target: this.highlightEl,
				oldValue: this.oldValue,
				newValue: nodeValue
			});
		}
		
		this.highlightEl = null;
	}
}

customElements.define('frmdb-wysiwyg-editor', WysiwygEditorComponent);
