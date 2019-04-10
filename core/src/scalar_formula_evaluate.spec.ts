import { scalarFormulaEvaluate } from "./scalar_formula_evaluate";

describe('scalarFormulaEvalaluate', () => {

    fit('should evaluate scalar formulas', () => {
        let scalarFormula = "ISNUMBER(FIND(\"-total\", _id))";
        let obj1 = {_id: 'blabla-total'};
        let obj2 = {_id: 'blabliblu'};
        expect(scalarFormulaEvaluate(obj1, scalarFormula)).toBeTruthy();
        expect(scalarFormulaEvaluate(obj2, scalarFormula)).toBeFalsy();
        expect(scalarFormulaEvaluate(obj1, 'FIND("-total", _id)')).toEqual(7);
    });

});
