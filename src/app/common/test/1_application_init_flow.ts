import { ChangeObj } from "../domain/change_obj";

import * as meta from './mocks/mock-metadata';
import { MockData } from "./mocks/mock-data";

import { Entity } from '../domain/metadata/entity';
import { getDefaultTable } from "../domain/uimetadata/table";

export function flow() {
    let mockMetadata = new meta.MockMetadata();
    let mockData = new MockData(mockMetadata.entitiesMap);

    return {
        mockMetadata: mockMetadata,
        mockData: mockData,
        serviceFormTable: getDefaultTable(meta.Forms__ServiceForm as Entity)
    };
}

let dummyReturnVal = null == null ? null : flow(); // NB: someFunction is never called!
export type FlowDataType = typeof dummyReturnVal; 