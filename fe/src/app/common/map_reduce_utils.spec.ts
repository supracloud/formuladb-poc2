/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { packFunction } from "./map_reduce_utils";
import * as acorn from "acorn";
declare var emit: any;

describe('MapReduceUtils', () => {
    beforeEach(() => {
    });

    describe('should define all map/reduce functions with ES5 syntax', () => {
        it("lambda not supported", () => {
            expect(() => { acorn.parse('[1, 2, 3].map(x => x)', { ecmaVersion: 5 }) }).toThrowError(/Unexpected token/);
        });
        it("destructuring assignment not supported (but SpiderMonkey 1.8.5 seems to support it)", () => {
            expect(() => { acorn.parse('var {a, b} = {a: 1, b:2}', { ecmaVersion: 5 }) }).toThrowError(/Unexpected token/);
        });
        it("Object.keys should work", () => {
            expect(() => { acorn.parse('Object.keys({a: 1, b:2})', { ecmaVersion: 5 }) }).not.toThrow();
        });
        // expect(() => {acorn.parse(Mn.MAP_TEMPLATE('/A/B[x={{bla}}]/c').toString(), {ecmaVersion: 5})}).not.toThrow();
    });

    it("should be able to pack ES5 map function for CouchDB spiderMonkey", () => {
        let args = {
            typeRegex: 'R_A',
            emitKeyTempl: ['/R/B[bType = {{aType}}]/num'],
            getExpr: '/R/A/num',
        };
        function f2(doc, emitKeyTempl) {return doc._id + emitKeyTempl;}
        function map1(doc) {
            if (doc._id.match(args.typeRegex))
                emit(f2(doc, args.emitKeyTempl), f2(doc, args.getExpr));
        }
        let packedFunction = packFunction(map1, [f2], args);
        let expectedPackedFunction =
            `function packedFunc(doc) {
    var dependencies = {
        f2: function f2(doc, emitKeyTempl) { return doc._id + emitKeyTempl; }
    };
    var args = {
        "typeRegex": "R_A",
        "emitKeyTempl": [
            "/R/B[bType = {{aType}}]/num"
        ],
        "getExpr": "/R/A/num"
    }
    function zaFunc(doc, dependencies) {
                if (doc._id.match(args.typeRegex))
                    emit(f2(doc, args.emitKeyTempl), f2(doc, args.getExpr));
            }
    zaFunc(doc, dependencies);
}`.replace(/\r/g, '');
        expect(() => { acorn.parse(packedFunction, { ecmaVersion: 5 }) }).not.toThrow();

        let expectedLines = expectedPackedFunction.split(/\n/);
        packedFunction.split(/\n/).forEach((line, i) => {
            expect(line).toEqual(expectedLines[i])
        });
    });
});
