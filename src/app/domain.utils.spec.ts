import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { queryEntityPropertiesWithDeepPath, queryObjectWithDeepPath, extendEntityProperties } from './domain.utils';
import { Inventory__Product, Inventory__Order } from "./test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "./test/mocks/forms-metadata";
import { TableProperty, EntityProperties } from "./domain/metadata/entity";

describe('domain.utils', () => {
  beforeEach(() => {
  });

  it('should get entity properties from deep path', () => {
    let props = queryEntityPropertiesWithDeepPath(Inventory__Product.properties as EntityProperties, '/Inventory/Product/locations');
    expect(props).toEqual((Inventory__Product.properties['locations'] as TableProperty).properties);
  });

  it('should get object properties from deep path', () => {
    let props = queryObjectWithDeepPath({a: 1, b: 2, c: {c1: 123}}, '/Inventory/Product/c/c1');
    expect(props).toEqual(123);
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
