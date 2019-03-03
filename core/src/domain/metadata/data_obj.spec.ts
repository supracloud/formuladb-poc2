/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { parseDataObjId, mergeSubObj, getChildrenPrefix, DataObj } from './data_obj';
import { INV__Receipt1, INV__Receipt__Item1_1, INV__Receipt__Item1_2, INV__PRD__Location1, INV__PRD__Location12 } from '@core/test/mocks/inventory-data';
import { INV__Receipt__Item, INV__Receipt } from '@core/test/mocks/mock-metadata';

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

  fit('merge child DataObj correctly', () => {
    let parentObj = {
      ...INV__Receipt1,
      items: [
        INV__Receipt__Item1_1,
        INV__Receipt__Item1_2,
      ]
    };

    let mergeResult = mergeSubObj(parentObj, {
      _id: INV__Receipt__Item1_1._id,
      quantity: INV__Receipt__Item1_1.quantity + 123,
    } as DataObj);
    let mergedParentObj = _.cloneDeep(parentObj);
    mergedParentObj.items[0].quantity = INV__Receipt__Item1_1.quantity + 123;

    expect(mergeResult).toEqual(true);
    expect(parentObj).toEqual(mergedParentObj);

    let newChildObj = {
      _id: getChildrenPrefix(INV__Receipt__Item._id, 
        INV__Receipt1._id.replace(INV__Receipt._id + '~~', '')) + "1A2B",
      product_id: INV__PRD__Location12._id,
      quantity: 456,
    };
    mergeResult = mergeSubObj(parentObj, newChildObj);
    mergedParentObj = _.cloneDeep(parentObj);
    mergedParentObj.items.push(newChildObj);
  
    expect(mergeResult).toEqual(true);
    expect(parentObj).toEqual(mergedParentObj);

  });
});
