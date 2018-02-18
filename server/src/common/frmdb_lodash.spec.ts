import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import * as _ from "../../../src/app/common/frmdb_lodash";

import * as  expression_eval from 'expression-eval';

describe('frmdb_lodash', () => {
    beforeEach(() => {
    });

    it('mapProp should work correctly', () => {
        expect(_.mapProp([{}, {}, {}], 'i', 'index')).to.eql([{i:0},{i:1},{i:2}]);
        expect(_([{}, {}, {}]).mapProp('i', 'index').value()).to.eql([{i:0},{i:1},{i:2}]);
    });
});
