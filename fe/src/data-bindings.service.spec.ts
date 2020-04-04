/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import { Pn, Entity } from '@domain/metadata/entity';
import { DataBindingsService } from './data-bindings.service';
import { HTMLTools } from '@core/html-tools';
import { BACKEND_SERVICE } from './backend.service';
import { waitUntil } from '@domain/ts-utils';
import { FormService } from './form.service';

const htmlTools = new HTMLTools(document, new DOMParser());

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <input type="text" data-frmdb-filter="$FRMDB.A[].filter.f1.contains" />
    <div data-frmdb-table="$FRMDB.A[]">
        <span data-frmdb-value="$FRMDB.A[].f1"></span>
        <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123" />
    </div>
`;

describe('DataBindingsMonitor', () => {
    let dataBindingMonitor: DataBindingsService;

    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

        fetchMock.post(/\/formuladb-api\/changes-feed/, []);
        fetchMock.get('/formuladb-api/kvsf-test-app-for-specs', {
            _id: "kvsf-test-app-for-specs", description: "kvsf-test-app-for-specs-desc",
            pages: [
                { name: "index", html: "test-page.html" },
            ],
        });
        fetchMock.get('/formuladb-api/kvsf-test-app-for-specs/schema', {
            _id: "FRMDB_SCHEMA~~kvsf-test-app-for-specs",
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
        window.location.pathname = '/en-basic-1a1a1a-ffffff-Clean-$EDIT$/kvsf-test-app-for-specs/test-page.html';

        await waitUntil(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));
        dataBindingMonitor = new DataBindingsService(document.body, new FormService(document.body));
        fetchMock.post('/formuladb-api/kvsf-test-app-for-specs/A/SimpleAddHocQuery', [
            { _id: "A~~1", f1: "f1.1", f2: 101 },
            { _id: "A~~2", f1: "f1.2", f2: 102 },
        ]);
        await dataBindingMonitor.updateDOMForRoot();

        let normalizedHtml = htmlTools.normalizeHTML(document.body.innerHTML);
        let expectedNonFilteredHtml = htmlTools.normalizeHTML(/*html*/`
            <input type="text" data-frmdb-filter="$FRMDB.A[].filter.f1.contains">
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

        fetchMock.post('/formuladb-api/kvsf-test-app-for-specs/A/SimpleAddHocQuery', (url, req) => {
            expect(JSON.parse(req.body)?.filterModel?.f1).toEqual({
                filterType: "text",
                filter: '.2',
                type: "contains",
            });
            return [
                { _id: "A~~2", f1: "f1.2", f2: 102 },
            ];
        });

        let filterInputEl = document.body.querySelector('input[data-frmdb-filter="$FRMDB.A[].filter.f1.contains"]') as HTMLInputElement;
        filterInputEl.value = ".2";
        filterInputEl.dispatchEvent(new Event('change', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 250));

        let normalizedHtml = htmlTools.normalizeHTML(document.body.innerHTML);
        let expectedFilteredHtml = htmlTools.normalizeHTML(/*html*/`
            <input type="text" data-frmdb-filter="$FRMDB.A[].filter.f1.contains">
            <div data-frmdb-table="$FRMDB.A[]" data-frmdb-record="A~~2">
                <span data-frmdb-value="$FRMDB.A[].f1">f1.2</span>
                <input type="number" data-frmdb-value="$FRMDB.A[].f2" max="123">
            </div>
        `);
        expect(normalizedHtml).toEqual(expectedFilteredHtml);
    });
});
