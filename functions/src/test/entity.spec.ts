/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { InventoryProduct, InventoryOrder } from "../test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, extendEntityProperties, HasEntityProperties, ChildTableProperty, isSubTableProperty } from "./entity";

describe('Entity', () => {
  beforeEach(() => {
  });

  it('extendEntityProperties should correctly extend entities', () => {
    let expected = _.cloneDeep(Forms__ServiceForm.props.service_form_units);
    expected.props!.items = _.cloneDeep(InventoryOrder.props.order_item_table);
    expected.props!.sales_agent = _.cloneDeep(InventoryOrder.props.sales_agent);
    expected.props!.creation_date = _.cloneDeep(InventoryOrder.props.creation_date);
    
    if (isSubTableProperty(Forms__ServiceForm.props.service_form_units)) {
      extendEntityProperties(Forms__ServiceForm.props.service_form_units, InventoryOrder.props);
    }

    let x = Forms__ServiceForm.props.service_form_units;
    expect(x).toEqual(expected);
  });
});
