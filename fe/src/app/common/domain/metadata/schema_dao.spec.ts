/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { DAG } from "./dag";

describe('SchemaDAO', () => {
    beforeEach(() => {
    });

    it('should correctly define a formula DAG and allow traversing', async (done) => {
        let dag = new DAG();
        let n1 = dag.addRoot({id: "1"});
        n1.addChild({id: "1.1"});
        let n1_2 = n1.addChild({id: "1.2"});
        n1_2.addChild({id: "1.2.1"}).addChild({id: "1.2.1.1"});
        n1_2.addChild({id: "1.2.2"}).addChild({id: "1.2.2.1"});

        let arr: string[] = [];
        await dag.traverseFrom(n1_2.obj.id, x => arr.push(x.id));

        expect(arr).toEqual(["1.2.1", "1.2.2", "1.2.1.1", "1.2.2.1"]);

        done();
    });
});
