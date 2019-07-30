import { Entity, Pn } from "@domain/metadata/entity";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

const HTML = /*html*/`
    <div data-frmdb-record="A~~_New_Record_">
        <input type="text" data-frmdb-value="f1" />
    </div>
`;

describe('FormService', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/test-tenant/test-app', {
            _id: "test-app", description: "test-app-desc",
            pages: [
                { name: "index", html: "index.html" },
            ],
        });
        fetchMock.get('/formuladb-api/test-tenant/test-app/schema', {
            _id: "FRMDB_SCHEMA",
            entities: {
                A: {
                    _id: 'A', 
                    props: {
                        _id: { name: "_id", propType_: Pn.STRING },
                        f1:  { name: "f1", propType_: Pn.STRING },
                    },
                } as Entity,
            }
        });
    });

    afterEach(fetchMock.restore)

    fit('should allow creation of new records', async (done) => {
        window.location.pathname = '/test-tenant/test-app';
        document.write(HTML);

        expect(document.querySelector('[data-frmdb-value]') instanceof HTMLInputElement).toEqual(true);

        done();
    });

    it('should allow updating of records', async (done) => {

        done();
    });
});
