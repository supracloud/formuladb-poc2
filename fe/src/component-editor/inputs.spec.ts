import { ResponsiveClassSelectInput } from "./inputs";
import { HTMLTools } from "@core/html-tools";

const htmlTools = new HTMLTools(document, new DOMParser());

describe('ComponentEditor Inputs', () => {

    it('ResponsiveClassSelectInput', done => { 
		document.body.innerHTML = '<frmdb-responsive-class-select-input></frmdb-responsive-class-select-input>';
        let el: ResponsiveClassSelectInput = document.querySelector('frmdb-responsive-class-select-input') as ResponsiveClassSelectInput;

		el.setValue('px-1 py-sm-2');
		let normalizedHtml = htmlTools.normalizeHTML(el.innerHTML);
	});

});
