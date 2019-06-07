import { reflectProp2Attr, reflectAttr2Prop } from "./frmdb-element";

describe('FrmdbElement', () => {
    beforeEach(() => {
    });

    fit('reflectProp2Attr/reflectAttr2Prop should convert correctly', () => {
        let val = {a: {x:1, y: "gigi", z: false}, b: {x: 3, y: "gogu", z: true}};
        expect(reflectProp2Attr(val, 'x', 'y')).toEqual("a: 1 gigi; b: 3 gogu");
        expect(reflectAttr2Prop("a: 1 gigi; b: 3 gogu", {x: 0, y: 'str'}, 'x', 'y')).toEqual({a: {x:1, y: "gigi"}, b: {x: 3, y: "gogu"}});
        expect(reflectProp2Attr(val, 'x')).toEqual("a: 1; b: 3");
        expect(reflectProp2Attr(val, 'x', 'y', 'z')).toEqual("a: 1 gigi false; b: 3 gogu true");
        expect(reflectAttr2Prop("a: 1 gigi false; b: 3 gogu true", {x: 0, y: 'str', z: true}, 'x', 'y', 'z')).toEqual(val);

        let valWithOptional: {[name: string]: {x: number, y?: string}} = {a: {x: 1}, b: {x: 2, y: "bla"}};
        expect(reflectProp2Attr(valWithOptional, 'x', 'y')).toEqual("a: 1; b: 2 bla");

        expect(reflectAttr2Prop("a; b; c", {name: "string"}, "name")).toEqual({a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'}})
    })
});
