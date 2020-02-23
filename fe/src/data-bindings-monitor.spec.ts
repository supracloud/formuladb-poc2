/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import * as lolex from "lolex";
import { Pn, Entity } from '@domain/metadata/entity';
import { DataBindingsMonitor } from './data-bindings-monitor';
import { HTMLTools } from '@core/html-tools';
import { BACKEND_SERVICE } from './backend.service';
import { waitUntil } from '@domain/ts-utils';

const htmlTools = new HTMLTools(document, new DOMParser());

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <input type="text" data-frmdb-value="$FRMDBQ.A[].f1" />
    <div data-frmdb-table="$FRMDB.A[]">
        <span data-frmdb-value="$FRMDB.A[].f1"></span>
        <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123" />
    </div>
`;

describe('DataBindingsMonitor', () => {
    let clock;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

        fetchMock.post(/\/formuladb-api\/changes-feed/, []);
        fetchMock.get('/formuladb-api/spec-apps/test-app', {
            _id: "test-app", description: "test-app-desc",
            pages: [
                { name: "index", html: "test-page.html" },
            ],
        });
        fetchMock.get('/formuladb-api/spec-apps/test-app/schema', {
            _id: "FRMDB_SCHEMA~~test-app",
            entities: {
                A: {
                    _id: 'A',
                    props: {
                        _id: { name: "_id", propType_: Pn.STRING },
                        f1: { name: "f1", propType_: Pn.STRING },
                        f2: { name: "f2", propType_: Pn.NUMBER },
                    },
                } as Entity,
            }
        });
    });

    afterEach(() => {
        fetchMock.restore();
        if (clock) clock.uninstall();
    })

    it('should update on filter change', async (done) => {

        document.body.innerHTML = HTML;
        window.location.pathname = '/en-basic-1a1a1a-ffffff-Clean-$E$/spec-apps/test-app/test-page.html';

        await waitUntil(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));
        let dataBindingMonitor = new DataBindingsMonitor(document.body);
        fetchMock.post('/formuladb-api/spec-apps/test-app/A/SimpleAddHocQuery', [
            { _id: "A~~1", f1: "f1.1", f2: 101 },
            { _id: "A~~2", f1: "f1.2", f2: 102 },
        ]);
        await dataBindingMonitor.updateDOMForRoot();

        let normalizedHtml = htmlTools.normalizeHTML(document.body.innerHTML);
        let expectedNonFilteredHtml = /*html*/`
            <input type="text" data-frmdb-value="$FRMDBQ.A[].filter-contains.f1">
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~1">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.1</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~2">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.2</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>"
        `;
        expect(normalizedHtml).toEqual(expectedNonFilteredHtml);


        fetchMock.post('/formuladb-api/spec-apps/test-app/A/SimpleAddHocQuery', (url, req) => {
            return [
                { _id: "A~~1", f1: "f1.1", f2: 101 },
            ];
        });
        (document.body.querySelector('input[data-frmdb-value="$FRMDBQ.A[].f1"]') as HTMLInputElement).value = ".1";
        clock = lolex.install();
        clock.tick(101);

        normalizedHtml = htmlTools.normalizeHTML(document.body.innerHTML);
        let expectedFilteredHtml = /*html*/`
            <input type="text" data-frmdb-value="$FRMDBQ.A[].f1">
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~1">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.1</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
        `;
        expect(normalizedHtml).toEqual(expectedFilteredHtml);

        done();
    });
});
