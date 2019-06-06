import { val2attr, attr2val } from "./frmdb-element";

describe('FrmdbElement', () => {
    beforeEach(() => {
    });

    fit('val2attr/attr2val should convert correctly', () => {
        let val = {a: {x:1, y: "gigi"}, b: {x: 3, y: "gogu"}};
        expect(val2attr(val, 'x', 'y')).toEqual("a: 1 gigi; b: 3 gogu");
        expect(attr2val("a: 1 gigi; b: 3 gogu", {x: 0, y: 'str'}, 'x', 'y')).toEqual(val);
    })
});
