import { FrmdbStore } from "./frmdb_store";
import { BaseObj, SubObj } from "./domain/base_obj";
import * as _ from "./frmdb_lodash";
import * as moment from "moment";

import * as  expression_eval from 'expression-eval';

//TODO: move this to frmdb_lodash
const mapKeysDeep = (obj, cb) =>
    _.mapValues(
        _.mapKeys(obj, cb),
        val => (_.isPlainObject(val) ? mapKeysDeep(val, cb) : val),
    );

export type CompiledExpression = (context: any) => any;
export type DateString = string;

export class ExpressionEvaluator {

    private functions = {
        DATE_UTILS: (date: DateString, oper: 'START_OF_MONTH' | 'END_OF_MONTH'): DateString => {
            let mom = moment(date, 'YYYY-MM-DD-HH-mm-ss-SSS', false);
            switch (oper) {
                case 'START_OF_MONTH':
                    return mom.startOf('month').format('YYYY-MM-DD-HH-mm-ss-SSS');
                case 'END_OF_MONTH':
                    return mom.endOf('month').format('YYYY-MM-DD-HH-mm-ss-SSS');
                default:
                    throw new Error('DATE_UTILS unknown operation ' + oper);
            }
        },
        TEXT: (val: any, format: string) => {
            //TODO: proper implementation of Excel's TEXT function
            
            function pad(n, width, z?: '0') {
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }

            if (format.match(/^0+$/)) {
                return pad(val, format.length);
            }
        },
    };

    public compile(expression: string): CompiledExpression {
        let expr = expression
            .replace(/_id/g, 'id')
            .replace(/\$/g, 'THE_CURRENT_OBJ')
            .split(/(\.?\/\w+(?:\/\w+)*)/).map(x =>
                x.replace(/^\.\//, 'THE_CURRENT_OBJ.')
                    .replace(/^\//, 'THE_ROOT_OBJ.')
                    .replace(/\//g, '.'))
            .join('');
        return expression_eval.compile(expr);
    }

    public evaluate(expression: string, context: any): any {
        let compiledExpr = this.compile(expression);
        let ctx = mapKeysDeep(context, (value, key) => {
            if ('_id' == key) return 'id';
            if ('$' == key) return 'THE_CURRENT_OBJ';
            return key;
        });
        ctx.START_OF_MONTH = 'START_OF_MONTH';
        ctx.END_OF_MONTH = 'END_OF_MONTH';
        _.extend(ctx, this.functions);

        return compiledExpr.call(null, ctx);
    }
}
