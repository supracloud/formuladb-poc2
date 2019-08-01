import { Entity, Pn } from "@domain/metadata/entity";
import { FormService } from "./form.service";
import { waitUntilNotNull } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

const HTML = /*html*/`
    <div data-frmdb-record="A~~">
        <input type="text" name="f1" data-frmdb-value="::f1" />
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
            _id: "FRMDB_SCHEMA~~test-app",
            entities: {
                A: {
                    _id: 'A', 
                    props: {
                        _id: { name: "_id", propType_: Pn.STRING },
                        f1:  { name: "f1", propType_: Pn.NUMBER },
                    },
                } as Entity,
            }
        });
    });

    afterEach(fetchMock.restore)

    fit('should allow creation of new records', async (done) => {
        window.location.pathname = '/test-tenant/test-app';
        document.write(HTML);

        let input: HTMLInputElement = document.querySelector('[data-frmdb-value]') as HTMLInputElement;
        expect(input instanceof HTMLInputElement).toEqual(true);
        expect(input!.value).toEqual('');

        let formService = new FormService(document.body);
        formService.updateRecordDOM({_id: 'A~~', f1: 12});
        expect(input!.value).toEqual("12");

        await waitUntilNotNull(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));

        input.value = "f1-NaN";
        input.dispatchEvent(new Event("change", {bubbles: true}));
        await new Promise(resolve => setTimeout(resolve, 500));
        expect(input.validationMessage).toEqual('Number expected for A.f1 = f1-NaN');

        fetchMock.post('/formuladb-api/test-tenant/test-app/event', {
            _id: 'A~~blabla', f1: 14
        });

        input.value = "13";
        input.dispatchEvent(new Event("change", {bubbles: true}));
        await new Promise(resolve => setTimeout(resolve, 500));
        // expect(input.value).toEqual('14');

        done();
    });

    it('should allow updating of records', async (done) => {

        done();
    });
});
