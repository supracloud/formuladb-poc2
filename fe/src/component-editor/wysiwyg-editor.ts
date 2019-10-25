import { Undo } from "../frmdb-editor/undo";

export const WysiwygEditor = {

	isActive: false,
	oldValue: '',
	doc: false,

	init: function (doc) {
		this.doc = doc;

		$("#bold-btn").on("click", function (e) {
			doc.execCommand('bold', false, null);
			e.preventDefault();
			return false;
		});

		$("#italic-btn").on("click", function (e) {
			doc.execCommand('italic', false, null);
			e.preventDefault();
			return false;
		});

		$("#underline-btn").on("click", function (e) {
			doc.execCommand('underline', false, null);
			e.preventDefault();
			return false;
		});

		$("#strike-btn").on("click", function (e) {
			doc.execCommand('strikeThrough', false, null);
			e.preventDefault();
			return false;
		});

		$("#link-btn").on("click", function (e) {
			doc.execCommand('createLink', false, "#");
			e.preventDefault();
			return false;
		});
	},

	undo: function () {
		this.doc.execCommand('undo', false, null);
	},

	redo: function () {
		this.doc.execCommand('redo', false, null);
	},

	edit: function (element) {
		element.attr({ 'contenteditable': true, 'spellcheck': false });
		$("#wysiwyg-editor").show();

		this.element = element;
		this.isActive = true;
		this.oldValue = element.html();
	},

	destroy: function (element) {
		element.removeAttr('contenteditable spellcheck');
		$("#wysiwyg-editor").hide();
		this.isActive = false;


		let node = this.element.get(0);
		Undo.addMutation({
			type: 'characterData',
			target: node,
			oldValue: this.oldValue,
			newValue: node.innerHTML
		});
	}
}
