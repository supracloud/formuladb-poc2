import { onEvent } from "@fe/delegated-events";
import { Undo } from "@fe/frmdb-editor/undo";
import { HighlightComponent } from "@fe/highlight/highlight.component";
import { getDoc } from "@core/dom-utils";

declare var $: null, jQuery: null;

const HTML: string = require('raw-loader!@fe-assets/wysiwyg-editor/wysiwyg-editor.component.html').default;

export class WysiwygEditorComponent extends HighlightComponent {

	oldValue: string = '';
	private doc: Document | null = null;

	set highlightEl(elem: HTMLElement | null) {
		if (this.highlightEl === elem) return;

		if (this.highlightEl) {
			this.destroy();
		}

		if (elem) {
			this.oldValue = elem.innerHTML;
			elem.setAttribute('contenteditable', 'true');
			elem.setAttribute('spellcheckker', 'false');
			this.style.display = 'block';
		}

		this.doc = elem ? getDoc(elem) : null;
		super.highlightEl = elem;
	}
	get highlightEl() {
		return super.highlightEl;
	}

	connectedCallback() {
		this.innerHTML = HTML;
		this.style.border = '1px solid rgb(61, 133, 253)';
	}

	action(event: MouseEvent, action: "bold" | "italic" | "underline" | "strikeThrough" | "createLink") {
		if (!this.doc) return;
		this.doc.execCommand(action, false, undefined);
		event.preventDefault();
		return false;
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
	
	disconnectedCallback() {
		this.destroy();
	}

	protected destroy() {
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
		
		super.highlightEl = null;
		this.style.display = 'none';
	}
}

customElements.define('frmdb-wysiwyg-editor', WysiwygEditorComponent);
