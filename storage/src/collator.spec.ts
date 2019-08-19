import * as FormuladbCollate from './collator';

describe('collator', () => {
    beforeEach(() => {
    });

    it('pad numbers', () => {
        expect(FormuladbCollate.toIndexableString([72])).toEqual("        72");
    })

    it('collate number and string', () => {
        expect(FormuladbCollate.toIndexableString([72, "73"])).toEqual("        72" + FormuladbCollate.SEP + "73");
    })

    it('collate number and string and boolean', () => {
        expect(FormuladbCollate.toIndexableString([72, "73", false])).toEqual("        72" + FormuladbCollate.SEP + "73" + FormuladbCollate.SEP + false);
    })

    it('should compare arrays correctly', () => {
        let cmp = FormuladbCollate.toIndexableString(['a2', 'R_A~~3']) < FormuladbCollate.toIndexableString(['a21', 'R_A~~5']);
        expect(cmp).toEqual(true);
    })
})
