import { Parser, Value } from "expr-eval";

import { FrmdbStore } from "./frmdb_store";
import { BaseObj, SubObj } from "./domain/base_obj";
import * as _ from "lodash";

const mapKeysDeep = (obj, cb) =>
  _.mapValues(
    _.mapKeys(obj, cb),
    val => (_.isPlainObject(val) ? mapKeysDeep(val, cb) : val),
  );

export class ExpressionInterpreter {
    public evaluate(expression: string, context: _.Dictionary<Value>): any {
        let expr = expression
            .replace(/_id/g, 'id')
            .replace(/\$/g, 'THE_CURRENT_OBJ')
            .split(/(\.?\/\w+(?:\/\w+)*)/).map(x => 
                x.replace(/^\.\//, 'THE_CURRENT_OBJ.')
                .replace(/^\//, 'THE_ROOT_OBJ.')
                .replace(/\//g, '.'))
            .join('');
        let ctx = mapKeysDeep(context, (value, key) => {
            if ('_id' == key) return 'id';
            if ('$' == key) return 'THE_CURRENT_OBJ';
            return key;
        });
        return Parser.evaluate(expr, ctx);
    }
    public evaluateTemplate(str: string, context: _.Dictionary<Value>) {
        
    }
}

export class ExecutionPlanRunner {
    constructor(private storageService: FrmdbStore) {}
}
