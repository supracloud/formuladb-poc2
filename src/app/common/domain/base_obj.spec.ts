import * as _ from 'lodash';
import { queryObjectWithDeepPath } from './base_obj';

describe('base_obj', () => {
  beforeEach(() => {
  });

  it('should get object properties from deep path', () => {
    let props = queryObjectWithDeepPath({ _id: "1", a: 1, b: 2, c: { _id: '1.1', c1: { _id: '1.1.1', c1prop: 123 } } }, '/Inventory/Product/c/c1');
    expect(props).toEqual({ ref_: '/Inventory/Product/1/c/c1', c1prop: 123 });

    props = queryObjectWithDeepPath({
      _id: "1", a: 1, b: 2, c: {
        _id: '1.1',
        c1: [{ _id: '1.1.1', c1prop: 123 }, { _id: '1.1.2', c1prop: 456 }]
      }
    }, '/Inventory/Product/c/c1/1');
    expect(props).toEqual({ ref_: '/Inventory/Product/1/c/c1/1.1.2', c1prop: 456 });

    props = queryObjectWithDeepPath({
      _id: "1", a: 1, b: 2, c: {
        _id: '1.1',
        c1: [{ _id: '1.1.1', c1prop: 123 }, { _id: '1.1.2', c1prop: 456 }, { _id: '1.1.3', c1prop: 789 }, { _id: '1.1.4', c1prop: 100 }]
      }
    }, '/Inventory/Product/c/c1/1.1.3');
    expect(props).toEqual({ ref_: '/Inventory/Product/1/c/c1/1.1.3', c1prop: 789 });
  });
});
