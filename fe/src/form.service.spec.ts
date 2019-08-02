import * as lolex from "lolex";

import { Entity, Pn } from "@domain/metadata/entity";
import { FormService } from "./form.service";
import { waitUntilNotNull } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";
import { ServerEventModifiedFormDataN } from "@domain/event";
import { setValue, navigate } from "./fe-test-urils.spec";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

const HTML = /*html*/`
    <div data-frmdb-record="A~~">
        <input type="text" data-frmdb-value="::f1" />
    </div>
`;

describe('FormService', () => {
    let clock;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

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

    afterEach(() => {
        fetchMock.restore();
        if (clock) clock.uninstall();
    })

    it('should allow editing of records', async (done) => {
        navigate('/test-tenant/test-app', HTML);

        let input: HTMLInputElement = document.querySelector('[data-frmdb-value]') as HTMLInputElement;
        expect(input instanceof HTMLInputElement).toEqual(true);
        expect(input!.value).toEqual('');

        let formService = new FormService(document.body);
        formService.updateRecordDOM({_id: 'A~~', f1: 12});
        expect(input!.value).toEqual("12");

        await waitUntilNotNull(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));

        clock = lolex.install();

        setValue(input, "f1-NaN");
        clock.tick(351);
        expect(input.validationMessage).toEqual('Number expected for A.f1 = f1-NaN');

        fetchMock.post('/formuladb-api/test-tenant/test-app/event', {
            type: ServerEventModifiedFormDataN,
            obj: { _id: 'A~~blabla', f1: 14 },
        });

        setValue(input, "13");
        clock.tick(351);
        expect(input.dataset.frmdbPending).toEqual('');

        await new Promise(resolve => process.nextTick(resolve));
        expect(input.value).toEqual('14');

        done();
    });

});
