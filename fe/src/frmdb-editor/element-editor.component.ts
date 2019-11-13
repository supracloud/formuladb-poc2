const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/element-editor.component.html').default;

export class ElementEditorComponent extends HTMLElement {

	constructor() {
		super();

		this.innerHTML = HTML;
    }
    
    setEditedEl(el: HTMLElement) {
        
    }
}
customElements.define('frmdb-element-editor', ElementEditorComponent);
