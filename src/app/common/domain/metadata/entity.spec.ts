import * as _ from 'lodash';
import * as acorn from "acorn";
import { Inventory__Product, Inventory__Order } from "../../../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../../../src/app/common/test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, propertiesOfEntity, extendEntityProperties, EntityProperties, SubTableProperty } from "../../../../../src/app/common/domain/metadata/entity";
import { Fn } from '../../schema_compiler';

describe('entity', () => {
  beforeEach(() => {
  });

  it('should define all map/reduce functions with ES5 syntax', () => {
    expect(() => {acorn.parse('[1, 2, 3].map(x => x', {ecmaVersion: 5})}).toThrowError(/Unexpected token/);
    // expect(() => {acorn.parse(Mn.MAP_TEMPLATE('/A/B[x={{bla}}]/c').toString(), {ecmaVersion: 5})}).not.toThrow();
  });

  it('should allow type-safe hardcoded formula definitions using Fn', () => {
    expect(Fn.SUM(Fn.IF(`Inventory_Order`,`x>10`))).toEqual(`SUM(IF(Inventory_Order,x>10))`);
  });

  it('should get entity properties from deep path', () => {
    let props = queryEntityWithDeepPath(Inventory__Product as Entity, 'Inventory_Product/inventoryLocation/@');
    expect(props).toEqual(propertiesOfEntity(Inventory__Product.inventoryLocation as SubTableProperty));
  });

  it('extendEntityProperties should correctly extend entities', () => {
    let expected = {
      ... _.cloneDeep(Forms__ServiceForm.service_form_units),
      items: _.cloneDeep(Inventory__Order.items)
    };
    extendEntityProperties(Forms__ServiceForm.service_form_units as SubTableProperty, propertiesOfEntity(Inventory__Order));

    expect(Forms__ServiceForm.service_form_units).toEqual(expected);
  });
});
