import { ChangeObj } from "../domain/change_obj";

import * as meta from './mocks/mock-metadata';
import { MockData } from "./mocks/mock-data";

import { getDefaultTable } from "../domain.utils";
import { Entity } from '../domain/metadata/entity';

export var mockMetadata = new meta.MockMetadata();
export var mockData = new MockData(mockMetadata.entitiesMap);
