import { CircularJSON } from "./json-stringify";

export function assertDeepContains(context: string, actual: Object, expected: Object) {
    for (let k of Object.keys(expected)) {
        let currentCtx = `${context}.${k}`;
        let detailedCtx = `${currentCtx} actual ${CircularJSON.stringify(actual)}, expected ${CircularJSON.stringify(expected)}`;
        let actualVal = actual[k];
        let expectedVal = expected[k];
        if (typeof expectedVal === "object") {
            if (typeof actualVal === "object") {
                assertDeepContains(currentCtx, actualVal, expectedVal);
            } else {
                fail(`actual object not found, ${detailedCtx}`);
            }
        } else {
            expect(actualVal).withContext(`equal, ${detailedCtx}`).toEqual(expectedVal);
        }
    }
}