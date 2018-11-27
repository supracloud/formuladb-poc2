import { CompiledFormula } from "../domain/metadata/execution_plan";
import * as _ from "lodash";
import { isExpression } from "jsep";

export function toStringCompiledFormula(formula: CompiledFormula) {
	function toString(object) {
		return _.transform(object, function(result, value, key) {
            if (isExpression(value)) {
                result[key] = value.origExpr;
            } 
            // else if (value instanceof Array && (''+key).match(/.*Expr$/)) {
            //     result[key] = '[' + value.map() + ']';
            // } 
            else if (_.isObject(value)) {
                result[key] = toString(value);
            } 
            else {
                result[key] = value;
            }
		});
    }
    return JSON.stringify(toString(formula), null, 4);
    // return JSON.stringify(
    //     {
    //         rawExpr: formula.rawExpr.origExpr,
    //         targetEntityName: formula.targetEntityName,
    //         targetPropertyName: formula.targetPropertyName,
    //         triggers: (formula.triggers||[]).map(trg => {return {
    //             rawExpr: trg.rawExpr.origExpr,

    //         }})
    //     }, null, 4
    // );
}

function difference(object, base) {
}