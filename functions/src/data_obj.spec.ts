/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Inventory, ReceiptItem, InventoryReceipt } from "./test/mocks/inventory-metadata";
import { parseDataObjId, mergeSubObj, getChildrenPrefix, DataObj } from '@domain/metadata/data_obj';
import { InventoryReceipt1, ReceiptItem1_1, ReceiptItem1_2, ProductLocation12, ProductLocation1 } from './test/mocks/inventory-data';

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

  it('merge child DataObj correctly', () => {
    let parentObj = {
      ...InventoryReceipt,
      receipt_item_table: [
        ReceiptItem1_1,
        ReceiptItem1_2,
      ]
    };

    let mergedParentObj = _.cloneDeep(parentObj);
    let mergeResult = mergeSubObj(mergedParentObj, {
      _id: ReceiptItem1_1._id,
      product_id: ProductLocation1._id,
      quantity: ReceiptItem1_1.quantity + 123,
      price: ProductLocation1.price,
    } as DataObj);
    let expectedParentObj = _.cloneDeep(parentObj);
    expectedParentObj.receipt_item_table[0].quantity = ReceiptItem1_1.quantity + 123;

    expect(mergeResult).toEqual(true);
    expect(mergedParentObj).toEqual(expectedParentObj);

    let newChildObj = {
      _id: getChildrenPrefix(ReceiptItem._id, 
        InventoryReceipt._id.replace(InventoryReceipt._id + '~~', '')) + "1A2B",
      product_id: ProductLocation12._id,
      quantity: 456,
      price: ProductLocation12.price,
    };
    mergedParentObj = _.cloneDeep(parentObj);
    mergeResult = mergeSubObj(mergedParentObj, newChildObj);
    expectedParentObj = _.cloneDeep(parentObj);
    expectedParentObj.receipt_item_table.push(newChildObj);
  
    expect(mergeResult).toEqual(true);
    expect(mergedParentObj).toEqual(expectedParentObj);

  });
});
