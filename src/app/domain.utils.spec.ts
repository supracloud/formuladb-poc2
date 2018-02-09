import { TestBed } from '@angular/core/testing';
import { queryEntityPropertiesWithDeepPath, queryObjectWithDeepPath } from './domain.utils';
import { Inventory__Product } from "./test/mocks/inventory-metadata";
import { TableProperty } from "./domain/metadata/entity";

describe('domain.utils', () => {
  beforeEach(() => {
  });

  it('should get entity properties from deep path', () => {
    let props = queryEntityPropertiesWithDeepPath(Inventory__Product.properties, '/Inventory/Product/locations');
    expect(props).toEqual((Inventory__Product.properties['locations'] as TableProperty).properties);
  });
  it('should get object properties from deep path', () => {
    let props = queryObjectWithDeepPath({a: 1, b: 2, c: {c1: 123}}, '/Inventory/Product/c/c1');
    expect(props).toEqual(123);
  });
});
