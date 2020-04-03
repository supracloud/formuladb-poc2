/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import * as lolex from "lolex";
import { Pn, Entity } from '@domain/metadata/entity';

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <div data-frmdb-record="A~~">
        <input type="text" data-frmdb-value="::f1" />
        <input type="number" data-frmdb-value="::f2" max="123" />
    </div>
`;

describe('changes-feed', () => {
    let clock;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

        fetchMock.post(/\/formuladb-api\/changes-feed/, []);
        fetchMock.get('/formuladb-api/test-tenant/test_app', {
            _id: "kvsf-test-app-for-specs", description: "kvsf-test-app-for-specs-desc",
            pages: [
                { name: "index", html: "index.html" },
            ],
        });
        fetchMock.get('/formuladb-api/test-tenant/test_app/schema', {
            _id: "FRMDB_SCHEMA~~kvsf-test-app-for-specs",
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

    it('should return empty reply when no events exist', async (done) => {

        clock = lolex.install();


        expect(true).toEqual(false, "TODO implement this spec");
        clock.tick(101);

        done();
    });
});
