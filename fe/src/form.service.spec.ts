/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import * as lolex from "lolex";

import { Entity, Pn } from "@domain/metadata/entity";
import { FormService } from "./form.service";
import { waitUntilNotNull } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";
import { setValue, navigate } from "./fe-test-urils.spec";
import { ServerEventModifiedFormData } from '@domain/event';

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <div data-frmdb-record="A~~">
        <input type="text" data-frmdb-value="::f1" />
        <input type="number" data-frmdb-value="::f2" max="123" />
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
                        f2:  { name: "f2", propType_: Pn.NUMBER },
                    },
                } as Entity,
            }
        });
    });

    afterEach(() => {
        fetchMock.restore();
        if (clock) clock.uninstall();
    })

    it('mock debounce example', async (done) => {

        clock = lolex.install();

        let cnt = 0;
        let debounced = _.debounce(() => cnt++, 100);
        debounced();
        debounced();
        debounced();

        expect(cnt).toEqual(0);
        clock.tick(101);
        expect(cnt).toEqual(1);
        clock.tick(10);
        expect(cnt).toEqual(1); //increment is executed only once

        done();
    });

    it('should allow editing of records', async (done) => {
        navigate('/test-tenant/test-app', HTML);

        let f1Input: HTMLInputElement = document.querySelector('[data-frmdb-value="::f1"]') as HTMLInputElement;
        let f2Input: HTMLInputElement = document.querySelector('[data-frmdb-value="::f2"]') as HTMLInputElement;

        expect(f1Input instanceof HTMLInputElement).toEqual(true);
        expect(f1Input!.value).toEqual('');

        let formService = new FormService(document.body);
        formService.updateRecordDOM({_id: 'A~~', f1: 12});
        expect(f1Input!.value).toEqual("12");

        await waitUntilNotNull(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));

        clock = lolex.install();

        fetchMock.post('/formuladb-api/test-tenant/test-app/event', (url, req) => {
            throw new Error("API should not be called when client side validation fails! " + req.body);
        });

        setValue(f1Input, "f1-NaN");
        clock.tick(351);
        expect(f1Input.validationMessage).toEqual('Number expected for A.f1 = f1-NaN');

        setValue(f1Input, "12");
        setValue(f2Input, "1000");
        clock.tick(351);
        expect(f1Input.validity.valid).toEqual(true);
        expect(f2Input.validity.valid).toEqual(false);
        expect(f2Input.validationMessage).toMatch(/123|constraints/i);

        fetchMock.post('/formuladb-api/test-tenant/test-app/event', {
            type: "ServerEventModifiedFormData",
            obj: { _id: 'A~~blabla', f1: 14 },
        });

        setValue(f1Input, "13");
        setValue(f2Input, "5");
        clock.tick(351);
        expect(f1Input.dataset.frmdbPending).toEqual('');

        await new Promise(resolve => process.nextTick(resolve));
        expect(f1Input.value).toEqual('14');

        done();
    });

});
