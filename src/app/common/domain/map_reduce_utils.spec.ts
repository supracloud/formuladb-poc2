import { emit, packMapFunction, matchesTypeES5, getES5, evalTemplateES5 } from "./map_reduce_utils";
import * as acorn from "acorn";

fdescribe('MapReduceUtils', () => {
    beforeEach(() => {
    });

    fit("should be able to pack ES5 map function for CouchDB spiderMonkey", () => {
        function map1(doc, typeRegex, emitKeyTempl, getExpr) {
            if (doc._id.match(typeRegex)) 
                emit(evalTemplateES5(doc, emitKeyTempl), getES5(doc, getExpr));
        }
        let packedFunction = packMapFunction(map1, [getES5, evalTemplateES5], {
            typeRegex: /R_A/,
            emitKeyTempl: '/R/B[bType = {{aType}}]/num',
            getExpr: '/R/A/num',
        });
        expect(() => {acorn.parse(packedFunction, {ecmaVersion: 5})}).not.toThrow();
        // expect(packedFunction).toEqual('TBD');
    });
});
