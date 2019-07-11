/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { VNavComponent } from './v-nav.component';
import { VNavSegmentComponent } from './v-nav-segment.component';
import { Schema_inventory } from '@test/mocks/mock-metadata';

describe('VNavComponent', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/unknown-app/schema', Schema_inventory);
    });

    afterEach(fetchMock.restore)

    it('should render', async (done) => { 
        document.body.innerHTML = '<frmdb-v-nav></frmdb-v-nav>';
        let el: VNavComponent = document.querySelector('frmdb-v-nav') as VNavComponent;
        expect(el instanceof VNavComponent).toEqual(true);
        expect(el.firstChild instanceof VNavSegmentComponent).toEqual(true);
        expect((el.firstChild as VNavSegmentComponent).frmdbState).toEqual({});
        console.log(el.outerHTML);

        await new Promise(resolve => setTimeout(resolve, 200));
        expect((el.firstChild as VNavSegmentComponent).frmdbState).toEqual({nav: []});
        console.log(el.outerHTML);
        done();
    });
});
