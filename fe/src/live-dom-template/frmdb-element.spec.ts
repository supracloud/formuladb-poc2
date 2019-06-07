import { reflectProp2Attr, reflectAttr2Prop } from "./frmdb-element";

describe('FrmdbElement', () => {
    beforeEach(() => {
    });

    fit('reflectProp2Attr/reflectAttr2Prop should convert correctly', () => {
        let example = {a: {x: 0, y: "str", z: true}, b: {bb: 0, bc: "str"}, c: true, d: 0};
        let prop = {a: {x:1, y: "gigi", z: false}, b: {bb: 3, bc: "gogu"}, c: false, d: 123};
        let attr = "a: 1 gigi false; b: 3 gogu; c: false; d: 123";

        expect(reflectProp2Attr(prop, example)).toEqual("a: 1 gigi false; b: 3 gogu; c: false; d: 123");
        expect(reflectAttr2Prop(attr, example)).toEqual(prop);
        expect(reflectAttr2Prop("a: 1 gigi; b: 3", example) as any).toEqual({a: {x:1, y: "gigi"}, b: {bb: 3}});

        let smallExample = {a: {x: 0}, b: {bb: 0}};
        let smallProp = {a: {x: 1}, b: {bb: 3}};;
        let smallAttr = "a: 1; b: 3";
        
        expect(reflectProp2Attr(smallProp, smallExample)).toEqual(smallAttr);
        expect(reflectAttr2Prop(smallAttr, smallExample)).toEqual(smallProp);
        expect(reflectProp2Attr(prop, smallExample)).toEqual(smallAttr);
        expect(reflectAttr2Prop(smallAttr, example) as any).toEqual(smallProp);
        expect(reflectProp2Attr(smallProp, example)).toEqual(smallAttr);

        expect(reflectAttr2Prop("a; b; c", ["str"])).toEqual(["a", "b", "c"]);
        expect(reflectAttr2Prop("abc", "str")).toEqual("abc");
        expect(reflectAttr2Prop("123", 0)).toEqual(123);
        expect(reflectAttr2Prop("true", false)).toEqual(true);
    })
});
