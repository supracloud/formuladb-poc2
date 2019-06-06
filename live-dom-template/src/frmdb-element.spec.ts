import { val2attr, attr2val } from "./frmdb-element";

describe('FrmdbElement', () => {
    beforeEach(() => {
    });

    fit('val2attr/attr2val should convert correctly', () => {
        console.warn("ERERERER");
        console.warn("ERERERER");
        console.warn("ERERERER");
        console.warn("ERERERER");
        let val = {a: {x:1, y: "gigi", z: false}, b: {x: 3, y: "gogu", z: true}};
        expect(val2attr(val, 'x', 'y')).toEqual("a: 1 gigi; b: 3 gogu");
        expect(attr2val("a: 1 gigi; b: 3 gogu", {x: 0, y: 'str'}, 'x', 'y')).toEqual({a: {x:1, y: "gigi"}, b: {x: 3, y: "gogu"}});
        expect(val2attr(val, 'x')).toEqual("a: 1; b: 3");
        expect(val2attr(val, 'x', 'y', 'z')).toEqual("a: 1 gigi false; b: 3 gogu true");
        expect(attr2val("a: 1 gigi false; b: 3 gogu true", {x: 0, y: 'str', z: true}, 'x', 'y', 'z')).toEqual(val);

        let valWithOptional: {[name: string]: {x: number, y?: string}} = {a: {x: 1}, b: {x: 2, y: "bla"}};
        expect(val2attr(valWithOptional, 'x', 'y')).toEqual("a: 1; b: 2 bla");

        expect(attr2val("a; b; c", {name: "string"}, "name")).toEqual({a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'}})
    })
});
