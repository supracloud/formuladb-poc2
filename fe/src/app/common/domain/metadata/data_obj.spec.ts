/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Inventory___Product, Inventory___Order } from "../../test/mocks/inventory-metadata";
import { Forms___ServiceForm } from "../../test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, extendEntityProperties, HasEntityProperties, ChildTableProperty, isSubTableProperty } from "./entity";
import { parseDataObjId } from './data_obj';

describe('DataObj', () => {
  beforeEach(() => {
  });

  it('should parse _id(s) correctly', () => {
    let parsedObjId = parseDataObjId("Inventory___Product___Location~~1___1");
    expect(parsedObjId).toEqual({entityName: "Inventory___Product___Location", id: "Inventory___Product___Location~~1___1", uid: "1___1"});
    parsedObjId = parseDataObjId("Inventory___Product~~1");
    expect(parsedObjId).toEqual({entityName: "Inventory___Product", id: "Inventory___Product~~1", uid: "1"});
    expect(() => parseDataObjId('')).toThrow();
  });
});
