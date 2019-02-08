/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { INV__PRD, INV__Order } from "../../test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, extendEntityProperties, HasEntityProperties, ChildTableProperty, isSubTableProperty } from "./entity";

describe('Entity', () => {
  beforeEach(() => {
  });

  it('extendEntityProperties should correctly extend entities', () => {
    let expected = _.cloneDeep(Forms__ServiceForm.props.service_form_units);
    expected.props.items = _.cloneDeep(INV__Order.props.items);
    expected.props.sales_agent = _.cloneDeep(INV__Order.props.sales_agent);
    expected.props.creation_date = _.cloneDeep(INV__Order.props.creation_date);
    
    if (isSubTableProperty(Forms__ServiceForm.props.service_form_units)) {
      extendEntityProperties(Forms__ServiceForm.props.service_form_units, INV__Order.props);
    }

    let x = Forms__ServiceForm.props.service_form_units;
    expect(x).toEqual(expected);
  });
});
