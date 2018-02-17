import { Parser, Value, Expression } from "expr-eval";

import { FrmdbStore } from "./frmdb_store";
import { BaseObj, SubObj } from "./domain/base_obj";
import * as _ from "lodash";
import * as moment from "moment";
import { DateString } from "./domain/metadata/formula";

const mapKeysDeep = (obj, cb) =>
  _.mapValues(
    _.mapKeys(obj, cb),
    val => (_.isPlainObject(val) ? mapKeysDeep(val, cb) : val),
  );

export class ExpressionInterpreter {
    private parser: Parser;
    constructor() {
        this.parser = new Parser();
        (this.parser as any).functions.DATE_UTILS = 
            (date: DateString, oper: 'START_OF_MONTH' | 'END_OF_MONTH'): DateString => {
                let mom = moment(date, 'YYYY-MM-DD-HH-mm-ss-SSS', false);
                switch(oper) {
                    case 'START_OF_MONTH':
                        return mom.startOf('month').format('YYYY-MM-DD-HH-mm-ss-SSS');
                    case 'END_OF_MONTH':
                    return mom.endOf('month').format('YYYY-MM-DD-HH-mm-ss-SSS');
                    default:
                        throw new Error('DATE_UTILS unknown operation ' + oper);
                }
            };
    }

    public parse(expression: string): Expression {
        let expr = expression
            .replace(/_id/g, 'id')
            .replace(/\$/g, 'THE_CURRENT_OBJ')
            .split(/(\.?\/\w+(?:\/\w+)*)/).map(x => 
                x.replace(/^\.\//, 'THE_CURRENT_OBJ.')
                .replace(/^\//, 'THE_ROOT_OBJ.')
                .replace(/\//g, '.'))
            .join('');
        return this.parser.parse(expr);
    }
    public evaluate(expression: string, context: _.Dictionary<Value>): any {
        let expr = this.parse(expression);
        let ctx = mapKeysDeep(context, (value, key) => {
            if ('_id' == key) return 'id';
            if ('$' == key) return 'THE_CURRENT_OBJ';
            return key;
        });
        ctx.START_OF_MONTH = 'START_OF_MONTH';
        ctx.END_OF_MONTH = 'END_OF_MONTH';

        return expr.evaluate(ctx);
    }
}

export class ExecutionPlanRunner {
    constructor(private storageService: FrmdbStore) {}
}
