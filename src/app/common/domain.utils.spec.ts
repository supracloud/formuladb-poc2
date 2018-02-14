import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { queryEntityPropertiesWithDeepPath, getCopiedPropertiesFromReferencedObject, extendEntityProperties } from './domain.utils';
import { Inventory__Product, Inventory__Order } from "./test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "./test/mocks/forms-metadata";
import { TableProperty, EntityProperties } from "./domain/metadata/entity";

describe('domain.utils', () => {
  beforeEach(() => {
  });

  it('should get entity properties from deep path', () => {
    let props = queryEntityPropertiesWithDeepPath(Inventory__Product.properties as EntityProperties, '/Inventory/Product/inventoryLocation');
    expect(props).toEqual((Inventory__Product.properties['inventoryLocation'] as TableProperty).properties);
  });

  it('should get object properties from deep path', () => {
    let props = getCopiedPropertiesFromReferencedObject({_id: "bla", a: 1, b: 2, c: {c1: 123}}, {deepPath: '/Inventory/Product/c/c1'});
    expect(props).toEqual(123);

    props = getCopiedPropertiesFromReferencedObject({_id: "bla", a: 1, b: 2, c: {c1: 123, c2: 456, c3: {c3_1: 7, c3_2: 8}}}, {deepPath: '/Inventory/Product/c/c3', copiedProperties: ['../../a', '../c1', 'c3_1']});
    expect(props).toEqual({a: 1, c1: 123, c3_1: 7});
  });

  it('should correctly extend entities', () => {
    let expected = {
      ... _.cloneDeep(Forms__ServiceForm.properties.service_form_units.properties),
      items: _.cloneDeep(Inventory__Order.properties.items)
    };
    extendEntityProperties(Forms__ServiceForm.properties.service_form_units.properties as EntityProperties, 
      Inventory__Order.properties as EntityProperties);

    expect(Forms__ServiceForm.properties.service_form_units.properties).toEqual(expected);
  });
});
