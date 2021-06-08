/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import { Pn, Entity } from '@domain/metadata/entity';
import { addEventToChangesFeed, logPoll } from './changes-feed-routes';
import { ServerEventModifiedFormData } from '@domain/event';
import { $Dictionary } from '@domain/metadata/default-metadata';

const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;

const HTML = /*html*/`
    <div data-frmdb-record="A~~">
        <input type="text" data-frmdb-value="::f1" />
        <input type="number" data-frmdb-value="::f2" max="123" />
    </div>
`;

describe('changes-feed', () => {

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date());

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
                        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} },
                        f1:  { name: "f1", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                        f2:  { name: "f2", propType_: Pn.INPUT, actualType: {name: "NumberType"} },
                    },
                } as Entity,
            }
        });
    });

    afterEach(() => {
        fetchMock.restore();
        jasmine.clock().uninstall();
    })

    fit('should return object monitored object id(s)', async () => {
        let p = logPoll('Client1', [])
        jasmine.clock().tick(1100);
        let evs = await p;
        expect(evs).toEqual([]);

        let ev1 = new ServerEventModifiedFormData({_id: 'Some_Table~~abcd'});
        
        p = logPoll('Client1', [])
        addEventToChangesFeed(ev1);
        jasmine.clock().tick(1100);
        evs = await p;
        expect(evs).toEqual([]);

        p = logPoll('Client1', [ev1.obj._id])
        addEventToChangesFeed(ev1);
        jasmine.clock().tick(1100);
        evs = await p;
        expect(evs).toEqual([ev1]);

        p = logPoll('Client1', [])
        let ev2 = new ServerEventModifiedFormData({_id: `${$Dictionary._id}~~abcd`});
        addEventToChangesFeed(ev2)
        jasmine.clock().tick(1100);
        evs = await p;
        expect(evs).toEqual([ev2]);
    });
});
