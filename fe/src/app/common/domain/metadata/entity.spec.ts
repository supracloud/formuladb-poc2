/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { INV___PRD, INV___Order } from "../../test/mocks/inventory-metadata";
import { Forms___ServiceForm } from "../../test/mocks/forms-metadata";
import { Entity, queryEntityWithDeepPath, extendEntityProperties, HasEntityProperties, ChildTableProperty, isSubTableProperty } from "./entity";

describe('Entity', () => {
  beforeEach(() => {
  });

  it('extendEntityProperties should correctly extend entities', () => {
    let expected = _.cloneDeep(Forms___ServiceForm.props.service_form_units);
    expected.props.items$ = _.cloneDeep(INV___Order.props.items$);
    expected.props.sales_agent = _.cloneDeep(INV___Order.props.sales_agent);
    expected.props.creation_date = _.cloneDeep(INV___Order.props.creation_date);
    
    if (isSubTableProperty(Forms___ServiceForm.props.service_form_units)) {
      extendEntityProperties(Forms___ServiceForm.props.service_form_units, INV___Order.props);
    }

    let x = Forms___ServiceForm.props.service_form_units;
    expect(x).toEqual(expected);
  });
});
