import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import { ExpressionInterpreter } from '../../../src/app/common/execution_plan_runner';
import * as moment from "moment";
import * as _ from "lodash";

import * as jsep from 'jsep';
import * as  expression_eval from 'expression-eval';

describe('ExecutionPlanRunner', () => {
    beforeEach(() => {
    });

    it.only('should evaluate expressions correctly', () => {
        let exprI = new ExpressionInterpreter();
        expect(exprI.evaluate('$._id', { $: { _id: 123 } })).to.equal(123);
        expect(exprI.evaluate('"a" || "b"', {})).to.eql("ab");
        expect(exprI.evaluate('./gigi/gogu - 1', { $: { gigi: { gogu: 123 } } })).to.equal(122);
        expect(exprI.evaluate("DATE_UTILS(t, START_OF_MONTH)", { t: '2018-02-12' })).to.equal('2018-02-01-00-00-00-000');
        expect(exprI.evaluate("DATE_UTILS(t, END_OF_MONTH)", { t: '2018-02-12-22-01-59-123' })).to.equal('2018-02-28-23-59-59-999');

        const ast = expression_eval.parse('a + b / c'); // abstract syntax tree (AST)
        const value = expression_eval.eval(ast, { a: 2, b: 2, c: 5 }); // 2.4
        expect(value).to.eql(2.4);
        expect(expression_eval.compile('a + b / c').call(null, {a: 2, b: 2, c: 5})).to.eql(2.4);

        function fun(x) {return `fun(${x})`};
        expect(expression_eval.compile('fun(a)').call(null, {fun: fun, a: 'x'})).to.eql('fun(x)');

        let val1 = [
            {i: 0, time_of_arrival: '2018-02-12-22-01-59-003'}, 
            {i: 1, time_of_arrival: '2018-02-12-22-01-59-002'}, 
            {i: 2, time_of_arrival: '2018-02-12-22-01-59-004'}, 
            {i: 3, time_of_arrival: '2018-02-12-22-01-59-001'}
        ];
        let mapProp = (propName, expr) => {
            return (value, index) => _.set(value, propName, expr({value: value, index: index}))
        };
        _.mixin({'mapProp': (array, propName, expr) => {
            let compiledExpr = expression_eval.compile(expr);//TODO: memoize this 
            let compute = (value, index) => compiledExpr.call(null, {value: value, index: index});
            return _.map(array, (value, index) => _.set(value, propName, compute(value, index)));
        }});
        expect(_([{}, {}, {}])['mapProp']('i', 'index').value()).to.eql([{i:0},{i:1},{i:2}]);

        expect(
            expression_eval.compile(
                `_(val1).sortBy(["time_of_arrival"]).mapProp("i","index").mapProp("code","'00000000' + index").value()`
            )
            .call(null, {
                val1: val1, 
                _: _, 
            })).to.eql([
                {code: "000000000", i: 0, time_of_arrival: '2018-02-12-22-01-59-001'},
                {code: "000000001", i: 1, time_of_arrival: '2018-02-12-22-01-59-002'}, 
                {code: "000000002", i: 2, time_of_arrival: '2018-02-12-22-01-59-003'}, 
                {code: "000000003", i: 3, time_of_arrival: '2018-02-12-22-01-59-004'}, 
            ]);
    });
});
