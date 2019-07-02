import { reflectProp2Attr, reflectAttr2Prop } from "./frmdb-element";

describe('FrmdbElement', () => {
    beforeEach(() => {
    });

    it('reflectProp2Attr/reflectAttr2Prop should convert correctly', () => {
        let prop = {a: {x:1, y: "gigi", z: false}, b: {bb: 3, bc: "gogu"}, c: false, d: 123};
        let attr = `{a: {x: 1, 'y': gigi, z: false}, b: {bb: 3, bc: gogu}, c: false, d: 123}`;

        expect(reflectProp2Attr(prop)).toEqual(attr);
        expect(reflectAttr2Prop(attr)).toEqual(prop);

        let smallProp = {a: {x: 1}, b: {bb: 3}};
        let smallAttr = "{a: {x: 1}, b: {bb: 3}}";
        
        expect(reflectProp2Attr(smallProp)).toEqual(smallAttr);
        expect(reflectAttr2Prop(smallAttr)).toEqual(smallProp);

        expect(reflectAttr2Prop("[a, b, c]")).toEqual(["a", "b", "c"]);
        expect(reflectAttr2Prop("abc")).toEqual("abc");
        expect(reflectAttr2Prop("123")).toEqual(123);
        expect(reflectAttr2Prop("true")).toEqual(true);
    })
});
