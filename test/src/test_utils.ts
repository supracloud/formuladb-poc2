import { CompiledFormula, MapQuery } from "@domain/metadata/execution_plan";
import * as _ from "lodash";
import { CircularJSON } from "@domain/json-stringify";
import { isExpression, Expression } from "jsep";

export function toStringCompiledFormula(formula: string, compiledFormula: CompiledFormula) {
    function toStringArrayExpression(value: Expression[]) {
        return '[' + value.map(x => x.origExpr).join(', ') + ']';
    }
	function toString(object) {
		return _.transform(object, function(resultt, value, key: string | number) {
            let result: any = resultt;
            if (isExpression(value)) {
                result[key] = value.origExpr;
            } 
            else if (value instanceof Array && value.reduce((acc, current) => acc && isExpression(current), true)) {
                result[key] = toStringArrayExpression(value);
            }
            else if (key === 'query') {
                let query: MapQuery = value as MapQuery;
                result[key] = (query.inclusive_start ? '[  ' : '(  ') +
                    toStringArrayExpression(query.startkeyExpr) + ' ---> ' + toStringArrayExpression(query.endkeyExpr) +
                    (query.inclusive_end ? '  ]' : '  )')
            }
            else if (_.isObject(value)) {
                result[key] = toString(value);
            } 
            else {
                result[key] = value;
            }
		});
    }

    return "\n# " + compiledFormula.targetEntityName + '.' + compiledFormula.targetPropertyName + ' = ' + formula + "\n" + 
        compiledFormula.targetEntityName + '.' + compiledFormula.targetPropertyName + ' = ' + compiledFormula.rawExpr.origExpr + "\n" + 
        "```json\n" +
        CircularJSON.stringify(toString(compiledFormula.triggers), null, 4) +
        "\n```"
    ;
}

export function logCompileFormula(formula: string, compiledFormula: CompiledFormula) {
/*     if (typeof global !== 'undefined' && typeof require !== 'undefined' && global['FRMDB_TRACE_COMPILE_FORMULA'] === true) {
        const fs = require('fs');
        fs.appendFileSync(__dirname + '/' + "compiledFormulaExamples.md", toStringCompiledFormula(formula, compiledFormula));
    } */
}
