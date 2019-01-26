/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { ChangeObj } from "../domain/change_obj";

import * as meta from './mocks/mock-metadata';
import { MockData } from "./mocks/mock-data";

import { Entity} from '../domain/metadata/entity';
import { getDefaultTable } from "../domain/uimetadata/table";
import { _throw } from "../throw";

export function flow() {
    let mockMetadata = new meta.MockMetadata(meta.ExampleApps.service);
    let mockData = new MockData(mockMetadata.schema.entities);

    return {
        mockMetadata: mockMetadata,
        mockData: mockData,
        serviceFormTable: getDefaultTable(meta.Forms__ServiceForm),
    };
}

let dummyReturnVal = null == null ? null : flow(); // NB: someFunction is never called!
export type FlowDataType = typeof dummyReturnVal; 