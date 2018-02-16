import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import * as _ from 'lodash';
import {  } from "";
import { Inventory__Product, Inventory__Order } from "../../../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../../../src/app/common/test/mocks/forms-metadata";
import { TableProperty, Entity, queryEntityWithDeepPath, propertiesOfEntity, extendEntityProperties, EntityProperties } from "../../../../../src/app/common/domain/metadata/entity";

describe('entity', () => {
  beforeEach(() => {
  });

  it('should get entity properties from deep path', () => {
    let props = queryEntityWithDeepPath(Inventory__Product as Entity, '/Inventory/Product/inventoryLocation/@');
    expect(props).to.eql(propertiesOfEntity(Inventory__Product.inventoryLocation as TableProperty));
  });


  it('extendEntityProperties should correctly extend entities', () => {
    let expected = {
      ... _.cloneDeep(Forms__ServiceForm.service_form_units),
      items: _.cloneDeep(Inventory__Order.items)
    };
    extendEntityProperties(Forms__ServiceForm.service_form_units as TableProperty, propertiesOfEntity(Inventory__Order));

    expect(Forms__ServiceForm.service_form_units).to.eql(expected);
  });
});
