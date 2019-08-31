/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { FormulaEditorComponent } from './formula-editor.component';
import { normalizeHTML } from "@core/normalize-html";
import { InventorySchema } from '@test/inventory/metadata';

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
        console.log(el.innerHTML);
        let normalizedHtml = normalizeHTML(el.innerHTML);

        expect(normalizedHtml[0]).toEqual('<div class="formula-code-editor d-flex">');

        done();
    });
});
