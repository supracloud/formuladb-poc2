/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


describe('functions_compiler', () => {
    let formulas = [
        {
            testName: "scalar-functions having table-functions as argument",
            formula: 'MAX(SUMIF(A.num, a_bId = @[_bId]), 10)',
        },
    ];

    for (let testFormula of formulas) {
        xit(' should compile ' + testFormula.testName + ': ' + testFormula.formula, () => {
        });
    }
});
