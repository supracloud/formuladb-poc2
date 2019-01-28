/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import * as  expression_eval from 'expression-eval';

_.mixin({'mapProp': (array, propName, expr) => {
    let compiledExpr = expression_eval.compile(expr);//TODO: memoize this 
    let compute = (value, index) => compiledExpr.call(null, {value: value, index: index});
    return _.map(array, (value, index) => _.set(value, propName, compute(value, index)));
}});

declare module 'lodash' {
    interface LoDashStatic {
        mapProp<T>(array: Array<T>, propName: string, expr: string);
    }

    interface LoDashImplicitWrapper<TValue> {
        mapProp<T>(propName: string, expr: string);
    }

}

// export = _;
