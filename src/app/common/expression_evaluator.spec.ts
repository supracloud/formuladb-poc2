


import { ExpressionEvaluator } from '../../../src/app/common/expression_evaluator';
import * as moment from "moment";
import * as _ from "lodash";

import * as  expression_eval from 'expression-eval';

describe('ExecutionPlanRunner', () => {
    beforeEach(() => {
    });

    it(' should be using a correct expression evaluation library', () => {
        const ast = expression_eval.parse('a + b / c'); // abstract syntax tree (AST)
        const value = expression_eval.eval(ast, { a: 2, b: 2, c: 5 }); // 2.4
        expect(value).toEqual(2.4);
        expect(expression_eval.compile('a + b / c').call(null, { a: 2, b: 2, c: 5 })).toEqual(2.4);

        function fun(x) { return `fun(${x})` };
        expect(expression_eval.compile('fun(a)').call(null, { fun: fun, a: 'x' })).toEqual('fun(x)');
    });

    it('should evaluate expressions correctly', () => {
        let exprEval = new ExpressionEvaluator();
        expect(exprEval.evaluate('$._id', { $: { _id: 123 } })).toEqual(123);
        expect(exprEval.evaluate('"a" + "b"', {})).toEqual("ab");
        expect(exprEval.evaluate('./gigi/gogu - 1', { $: { gigi: { gogu: 123 } } })).toEqual(122);
        expect(exprEval.evaluate("DATE_UTILS(t, START_OF_MONTH)", { t: '2018-02-12' })).toEqual('2018-02-01-00-00-00-000');
        expect(exprEval.evaluate("DATE_UTILS(t, END_OF_MONTH)", { t: '2018-02-12-22-01-59-123' })).toEqual('2018-02-28-23-59-59-999');

        let val1 = [
            { i: 0, time_of_arrival: '2018-02-12-22-01-59-003' },
            { i: 1, time_of_arrival: '2018-02-12-22-01-59-002' },
            { i: 2, time_of_arrival: '2018-02-12-22-01-59-004' },
            { i: 3, time_of_arrival: '2018-02-12-22-01-59-001' }
        ];
        expect(_([{}, {}, {}])['mapProp']('i', 'index').value()).toEqual([{ i: 0 }, { i: 1 }, { i: 2 }]);

        expect(exprEval.evaluate(
            `_(val1).sortBy(["time_of_arrival"]).mapProp("i","index").mapProp("code","'00000000' + index").value()`,
            {
                val1: val1,
                _: _,
            })
        ).toEqual([
            { code: "000000000", i: 0, time_of_arrival: '2018-02-12-22-01-59-001' },
            { code: "000000001", i: 1, time_of_arrival: '2018-02-12-22-01-59-002' },
            { code: "000000002", i: 2, time_of_arrival: '2018-02-12-22-01-59-003' },
            { code: "000000003", i: 3, time_of_arrival: '2018-02-12-22-01-59-004' },
        ]);
    });
});
