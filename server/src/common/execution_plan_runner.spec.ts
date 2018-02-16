import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import { ExpressionInterpreter } from '../../../src/app/common/execution_plan_runner';

describe('ExecutionPlanRunner', () => {
    beforeEach(() => {
    });

    it.only('should evaluate expressions correctly', () => {
        let exprI = new ExpressionInterpreter();
        expect(exprI.evaluate('$._id', {$: {_id: 123}})).to.equal(123);
        expect(exprI.evaluate('./gigi/gogu - 1', {$: {gigi: {gogu: 123}}})).to.equal(122);
    });
});
