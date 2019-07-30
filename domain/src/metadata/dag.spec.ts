/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { DAG } from "./dag";

describe('DAG', () => {
    beforeEach(() => {
    });

    it('should allow traversing a subDAG starting from an object', async (done) => {
        let dag = new DAG();
        let n1 = dag.addRoot({id: "1"});
        let n1_1 = n1.addChild({id: "1.1"});
        let n1_2 = n1.addChild({id: "1.2"});
        n1_2.addChild({id: "1.2.1"}).addChild({id: "1.2.1.1"});
        n1_2.addChild({id: "1.2.2"}).addChild({id: "1.2.2.1"});

        dag.addParentChild({id: "1.1"}, {id: "1.2.1"});

        let arr: string[] = [];
        
        await dag.traverseFrom(n1_2.obj.id, x => arr.push(x.id));
        expect(arr).toEqual(["1.2.1", "1.2.2", "1.2.1.1", "1.2.2.1"]);

        arr = [];
        await dag.traverseFrom(n1_1.obj.id, x => arr.push(x.id));
        expect(arr).toEqual(["1.2.1", "1.2.1.1"]);
        
        done();
    });

    it('should detect cycles', () => {
        
        expect (() => {let dag = new DAG(); dag.addParentChild({id: "1"}, {id: "2"}).addChild({id: "1"})}).toThrowError(/already exists/);
        expect (() => {
            let dag: DAG<{id: string, x: number}> = new DAG(); 
            dag.addRootIfNotExists({id: "1", x: 1}); 
            dag.addRootIfNotExists({id: "1", x: 2}); 
        }).toThrowError(/different properties/);
        expect (() => {
            let dag: DAG<{id: string, x: number}> = new DAG(); 
            dag.addParentChild({id: "1", x: 1}, {id: "2", x: 1}); 
            dag.addParentChild({id: "1", x: 1}, {id: "2", x: 2});
        }).toThrowError(/different properties/);
        expect (() => {let dag = new DAG(); dag.addRoot({id: "1"}); dag.addRoot({id: "1"})}).toThrowError(/already exists/);
    });
});
