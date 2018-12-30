/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { INV___PRD, INV___Order } from "../../test/mocks/inventory-metadata";
import { Forms___ServiceForm } from "../../test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, extendEntityProperties, HasEntityProperties, ChildTableProperty, isSubTableProperty } from "./entity";
import { parseDataObjId } from './data_obj';

describe('DataObj', () => {
  beforeEach(() => {
  });

  it('should parse _id(s) correctly', () => {
    let parsedObjId = parseDataObjId("INV___PRD___Location~~1___1");
    expect(parsedObjId).toEqual({entityName: "INV___PRD___Location", id: "INV___PRD___Location~~1___1", uid: "1___1"});
    parsedObjId = parseDataObjId("INV___PRD~~1");
    expect(parsedObjId).toEqual({entityName: "INV___PRD", id: "INV___PRD~~1", uid: "1"});
    expect(() => parseDataObjId('')).toThrow();
  });
});
