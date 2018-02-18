


import * as _ from "../../../src/app/common/frmdb_lodash";

import * as  expression_eval from 'expression-eval';

describe('frmdb_lodash', () => {
    beforeEach(() => {
    });

    it('mapProp should work correctly', () => {
        expect(_.mapProp([{}, {}, {}], 'i', 'index')).toEqual([{i:0},{i:1},{i:2}]);
        expect(_([{}, {}, {}]).mapProp('i', 'index').value()).toEqual([{i:0},{i:1},{i:2}]);
    });
});
