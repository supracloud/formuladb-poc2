/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import { Pn, Entity } from '@domain/metadata/entity';
import { DataBindingsMonitor } from './data-bindings-monitor';
import { HTMLTools } from '@core/html-tools';
import { BACKEND_SERVICE } from './backend.service';
import { waitUntil } from '@domain/ts-utils';

const htmlTools = new HTMLTools(document, new DOMParser());

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <input type="text" data-frmdb-value="$FRMDBQ.A[].filter.f1.contains" />
    <div data-frmdb-table="$FRMDB.A[]">
        <span data-frmdb-value="$FRMDB.A[].f1"></span>
        <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123" />
    </div>
`;

describe('DataBindingsMonitor', () => {
    beforeAll(() => {
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

    afterAll(() => {
        fetchMock.restore();
    })

    it('should update page when filter is empty', async () => {

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
        let expectedNonFilteredHtml = htmlTools.normalizeHTML(/*html*/`
            <input type="text" data-frmdb-value="$FRMDBQ.A[].filter.f1.contains">
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~1">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.1</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~2">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.2</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
        `);
        expect(normalizedHtml).toEqual(expectedNonFilteredHtml);
    });

    it('should filter records and update page', async () => {

        fetchMock.post('/formuladb-api/spec-apps/test-app/A/SimpleAddHocQuery', (url, req) => {
            expect(JSON.parse(req.body)?.filterModel?.f1).toEqual({
                filterType: "text",
                filter: '.2',
                type: "contains",
            });
            return [
                { _id: "A~~2", f1: "f1.2", f2: 102 },
            ];
        });

        let filterInputEl = document.body.querySelector('input[data-frmdb-value="$FRMDBQ.A[].filter.f1.contains"]') as HTMLInputElement;
        filterInputEl.value = ".2";
        filterInputEl.dispatchEvent(new Event('change', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 250));

        let normalizedHtml = htmlTools.normalizeHTML(document.body.innerHTML);
        let expectedFilteredHtml = htmlTools.normalizeHTML(/*html*/`
            <input type="text" data-frmdb-value="$FRMDBQ.A[].filter.f1.contains">
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~2">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.2</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
        `);
        expect(normalizedHtml).toEqual(expectedFilteredHtml);
    });
});