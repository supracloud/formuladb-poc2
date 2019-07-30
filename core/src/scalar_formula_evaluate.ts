import { ScalarFunctionsImplementations } from "@functions/scalar_functions_implementations";
import { parseFormula, $e2s } from "./formula_parser";
import { Expression, isIdentifier } from "jsep";

const formulaCache: Map<string, CompiledScalarFormula> = new Map();

interface CompiledScalarFormula {
    scalarFormula: string; 
    formulaFunction: Function;
    functionBoundToContext: Function;
}

/**
 * FIXME/TODO WARNING !!! naive implementation with regards to security
 * 
 * It is very difficult to sandbox the JS code, a Function can always access the global object with 'this' keyword:
 * https://stackoverflow.com/questions/23595880/restrict-access-to-global-context-with-javascript
 * https://github.com/asvd/jailed
 */
function compileScalarFormula(scalarFormula: string): CompiledScalarFormula {
    let ast = parseFormula(scalarFormula);
    preProcessAst(ast);
    let formulaFunction = new Function('Ctx', 'Obj', 'return ' + $e2s(ast));
    let functionBoundToContext = formulaFunction.bind(null, ScalarFunctionsImplementations) as Function;
    return {scalarFormula, formulaFunction, functionBoundToContext};
}

function preProcessAst(node: Expression) {
    switch (node.type) {

        case 'CallExpression':
            if (isIdentifier(node.callee)) {
                node.callee.name = 'Ctx.' + node.callee.name;
            } else preProcessAst(node.callee);
            node.arguments.forEach(a => preProcessAst(a));
            break;
        case 'Identifier':
            node.name = 'Obj.' + node.name;
            break;
    }
}

export function scalarFormulaEvaluate(obj: {}, scalarFormula: string) {
    let compiledFunction = formulaCache.get(scalarFormula);
    if (!compiledFunction) {
        compiledFunction = compileScalarFormula(scalarFormula);
        formulaCache.set(scalarFormula, compiledFunction);
    }
    return compiledFunction.functionBoundToContext(obj);
}
