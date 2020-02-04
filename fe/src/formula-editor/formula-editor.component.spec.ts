/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { FormulaEditorComponent } from './formula-editor.component';
import { HTMLTools } from "@core/html-tools";
import { InventorySchema } from '@test/inventory/metadata';

const htmlTools = new HTMLTools(document, new DOMParser());

describe('FormulaEditorComponent', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/unknown-app/schema', InventorySchema);
    });

    afterEach(fetchMock.restore)

    it('should render', async (done) => { 
        document.body.innerHTML = '<frmdb-formula-editor></frmdb-formula-editor>';
        let el: FormulaEditorComponent = document.querySelector('frmdb-formula-editor') as FormulaEditorComponent;
        expect(el instanceof FormulaEditorComponent).toEqual(true);

        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(el.shadowRoot!.innerHTML);
        let normalizedHtml = htmlTools.normalizeHTML(el.shadowRoot!.innerHTML);

        expect(normalizedHtml[1]).toEqual('<link rel="stylesheet" href="/formuladb-env/icons/formuladb/icons.css">');
        expect(normalizedHtml[2]).toEqual('<div class="formula-code-editor">');

        done();
    });
});
