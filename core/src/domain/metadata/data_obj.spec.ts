/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { INV__PRD, INV__Order } from "../../test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../test/mocks/forms-metadata";
import { parseDataObjId } from './data_obj';

describe('DataObj', () => {
  beforeEach(() => {
  });

  it('should parse _id(s) correctly', () => {
    let parsedObjId = parseDataObjId("INV__PRD__Location~~1__1");
    expect(parsedObjId).toEqual({entityName: "INV__PRD__Location", id: "INV__PRD__Location~~1__1", uid: "1__1"});
    parsedObjId = parseDataObjId("INV__PRD~~1");
    expect(parsedObjId).toEqual({entityName: "INV__PRD", id: "INV__PRD~~1", uid: "1"});
    expect(() => parseDataObjId('')).toThrow();
  });
});
