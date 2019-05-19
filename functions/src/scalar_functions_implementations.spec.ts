import { ScalarFunctionsImplementations } from "./scalar_functions_implementations";

describe('ScalarFunctionsImplementations', () => {

    it('should reuse formula js functions', () => {
        expect(ScalarFunctionsImplementations.ISNUMBER(1)).toBeTruthy();
        expect(ScalarFunctionsImplementations.ISNUMBER("adsas")).toBeFalsy();
        expect(ScalarFunctionsImplementations.FIND("not found", "bla-total")).toBeUndefined();
        expect(ScalarFunctionsImplementations.FIND("-total", "bla-total")).toEqual(4);
    });

});
