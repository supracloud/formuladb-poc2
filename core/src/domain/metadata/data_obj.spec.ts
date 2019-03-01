/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { InventoryProduct, InventoryOrder } from "../../test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../test/mocks/forms-metadata";
import { parseDataObjId } from './data_obj';

describe('DataObj', () => {
  beforeEach(() => {
  });

  it('should parse _id(s) correctly', () => {
    let parsedObjId = parseDataObjId("ProductLocation~~1__1");
    expect(parsedObjId).toEqual({entityName: "ProductLocation", id: "ProductLocation~~1__1", uid: "1__1"});
    parsedObjId = parseDataObjId("InventoryProduct~~1");
    expect(parsedObjId).toEqual({entityName: "InventoryProduct", id: "InventoryProduct~~1", uid: "1"});
    expect(() => parseDataObjId('')).toThrow();
  });
});
