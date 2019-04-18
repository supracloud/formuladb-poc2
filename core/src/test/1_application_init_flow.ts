/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as meta from './mocks/mock-metadata';
import { MockData } from "./mocks/mock-data";

import { _throw } from '../throw';

export function flow() {
    let mockMetadata = new meta.MockMetadata();
    let mockData = new MockData({});

    return {
        mockMetadata: mockMetadata,
        mockData: mockData,
        // serviceFormTable: autoLayoutTabl(meta.Forms__ServiceForm),
    };
}

let dummyReturnVal = null == null ? null : flow(); // NB: someFunction is never called!
export type FlowDataType = typeof dummyReturnVal; 