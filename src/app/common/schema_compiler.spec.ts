import * as _ from 'lodash';
import { } from "";
import { Inventory__Product, Inventory__Order } from "../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../src/app/common/test/mocks/forms-metadata";
import { Entity, Schema, Pn } from "../../../src/app/common/domain/metadata/entity";
import { SchemaCompiler, Fn } from "../../../src/app/common/schema_compiler";
import { FrmdbStore } from "../../../src/app/common/frmdb_store";
import { KeyValueStoreMem } from "../../../src/app/common/key_value_store_mem";
import { General__Actor, General__Currency } from '../../../src/app/common/test/mocks/mock-metadata';
import { Sn } from './domain/metadata/stored_procedure';
import { CompiledFunction } from './domain/metadata/execution_plan';
import { matchesTypeES5, emit, evalTemplateES5, getES5, packMapFunction } from './domain/map_reduce_utils';

describe('SchemaCompiler', () => {
    beforeEach(() => {
    });

    it('should compile SUM absolute path', () => {
        let cf = SchemaCompiler.compileFormula('R_B.sum=', Fn.SUMIF(`R_A.num`, `aType == @(bType))`));
        let expectedCf = {
            triggers: [{
                viewName: 'R_B.sum=!1',
                observableFromObserver: 'R_A.num?aType=@(bType)',
                observerFromObservable: 'R_B.sum=?bType=@(aType)',
                map: packMapFunction(
                    function (doc) {
                        if (matchesTypeES5(doc, 'R_A.num'))
                            emit(evalTemplateES5(doc, 'R_B.sum=?bType=@(aType)'), getES5(doc, 'R_A.num'));
                    }, [matchesTypeES5, evalTemplateES5, getES5], {}),
                reduce: '_sum',
                queryOptsFromObserver: { keyTemplate: ['R_B.sum=?bType=@(aType)'] },
            }],
            expr: 'R_B.sum=?1',
        } as CompiledFunction;
    });

    it('should compile SUM translated relative path', () => {
        let cf = SchemaCompiler.compileFormula('R_B.sum=', Fn.SUMIF(`R_A.num`, `b->=@(_id))`));
        let expectedCf = {
            triggers: [{
                viewName: 'R_B.sum=!1',
                observableFromObserver: 'R_A.num?b->=@(_id)',
                observerFromObservable: 'R_B.sum=?_id=@(b->)',
                map: packMapFunction(
                    function (doc) {
                        if (matchesTypeES5(doc, 'R_A.num'))
                            emit([evalTemplateES5(doc, 'R_B.sum=?_id=@(b->)'), '0'], getES5(doc, 'R_A.num'));
                    }, [matchesTypeES5, evalTemplateES5, getES5], {}),
                reduce: '_sum',
                queryOptsFromObserver: { keyTemplate: ['R_B.sum=?_id=@(b->)', 0] },
            }],
            expr: 'R_B.sum=?1',
        } as CompiledFunction;
    });

    it('should compile simple expr with INDEX and TEXT translated relative path', () => {
        let cf = SchemaCompiler.compileFormula('R_B#str2=', `str1` + Fn.TEXT(Fn.MATCH(Fn.GROUP_BY(`R_B`, Fn.EOMONTH(`t`,-1), `t`), `t`), `"0000"`));
        let expectedCf = {
            triggers: [
                {
                    viewName: 'R_B#str2=?1',
                    observableFromObserver: 'R_B?(EOMONTH(t,-1)=EOMONTH({{t}},-1)).t',
                    observerFromObservable: 'R_B?(EOMONTH(t,-1)=EOMONTH({{t}},-1)).str2=',
                    map: packMapFunction(
                        function (doc) {
                            if (matchesTypeES5(doc, 'R_B#t'))
                                emit([getES5(doc, 'R_B.(EOMONTH(t,-1))'), getES5(doc, 'R_B#t'), '0'], 1);
                        }, [matchesTypeES5, getES5], {}),
                    reduce: '_count',
                    queryOptsFromObserver: { startkeyTemplate: ['EOMONTH({{t}},-1)', ''], endkeyTemplate: ['EOMONTH({{t}},-1)', '{{t}}'], group_level: 2 },
                },
                {
                    viewName: 'R_B#str2=?2',
                    observableFromObserver: 'R_B?(EOMONTH(t,-1)=EOMONTH({{t}},-1)).str1',
                    observerFromObservable: 'R_B?(EOMONTH(t,-1)=EOMONTH({{t}},-1)).str2=',
                    mapExprFromObservable: 'R_B#str1'
                },
            ],
            expr: 'R_B#str2=?2 + TEXT(R_B#str2=?1, "0000")',
        } as CompiledFunction;
    });
    
    it('should compile mock schema correctly', () => {
    });

});
