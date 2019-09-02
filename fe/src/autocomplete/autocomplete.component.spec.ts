/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { AutocompleteComponent } from './autocomplete.component';
import { InventorySchema } from '@test/inventory/metadata';

describe('AutocompleteComponent', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/unknown-app/schema', InventorySchema);
    });

    afterEach(fetchMock.restore)

    it('should render', async (done) => { 
        document.body.innerHTML = '<frmdb-autocomplete></frmdb-autocomplete>';
        let el: AutocompleteComponent = document.querySelector('frmdb-autocomplete') as AutocompleteComponent;
        expect(el instanceof AutocompleteComponent).toEqual(true);

        done();
    });
});
