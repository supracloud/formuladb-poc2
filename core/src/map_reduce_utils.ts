/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { MapFunctionAndQuery, MapFunctionAndQueryT, MapFunctionT } from "@core/domain/metadata/execution_plan";
import { Expression, StringLiteral, NumberLiteral } from "jsep";
import { DataObj } from "./domain/metadata/data_obj";
declare var emit: any;

export function isNumberES5(s) {
    return parseInt(s) + '' === s;
}
export function isPlainObjES5(o) {
    return typeof o == 'object' && o.constructor == Object;
}

export function jsonPathMapGetterExpr(jsonPath: string) {
    return 'doc.' + jsonPath.replace(/^\$\./, '').replace(/\[.*?\]/g, '');
}

export function evalExpression(doc: {}, expr) {
    //Copyright (c) 2017 Don McCurdy
    
    var binops = {
        '||': function (a, b) { return a || b; },
        '&&': function (a, b) { return a && b; },
        '|': function (a, b) { return a | b; },
        '^': function (a, b) { return a ^ b; },
        '&': function (a, b) { return a & b; },
        '==': function (a, b) { return a == b; }, // jshint ignore:line
        '!=': function (a, b) { return a != b; }, // jshint ignore:line
        '===': function (a, b) { return a === b; },
        '!==': function (a, b) { return a !== b; },
        '<': function (a, b) { return a < b; },
        '>': function (a, b) { return a > b; },
        '<=': function (a, b) { return a <= b; },
        '>=': function (a, b) { return a >= b; },
        '<<': function (a, b) { return a << b; },
        '>>': function (a, b) { return a >> b; },
        '>>>': function (a, b) { return a >>> b; },
        '+': function (a, b) { return a + b; },
        '-': function (a, b) { return a - b; },
        '*': function (a, b) { return a * b; },
        '/': function (a, b) { return a / b; },
        '%': function (a, b) { return a % b; }
    };

    var unops = {
        '-': function (a) { return -a; },
        '+': function (a) { return a; },
        '~': function (a) { return ~a; },
        '!': function (a) { return !a; },
    };

    function evaluateArray(list, context) {
        return list.map(function (v) {return evaluate(v, context)});
    }

    function evaluateMember(node, context) {
        var object = evaluate(node.object, context);
        if (node.computed) {
            //no computed members allowed by FormulaDB compiler, only column names
            return [object, object[node.property.name || node.property.value]];
        } else {
            return [object, object[node.property.name]];
        }
    }

    function evaluateBinop(op, left, right) {
        return binops[op](left, right);
    }

    function evaluateUnop(op, arg) {
        return unops[op](arg);
    }

    var contextFunctions = {
        //TODO: implement significance
        FLOOR: function (x, significance) {return Math.floor(x)},
        MAX: function(x, y) {return Math.max(x, y)},
        ABS: function(x) {return Math.abs(x)},
        TEXT: function TEXT(expr, format) {
            //TODO
        },
        REGEXREPLACE: function REGEXREPLACE(expr, regex, replacement) {
            //TODO
        },
        EOMONTH: function EOMONTH(expr, numMonths) {
            //TODO
        },
        SQRT: function SQRT(expr) {
            //TODO
        },
        ROUND: function ROUND(expr) {
            //TODO
        },
        FACT: function FACT(expr) {
            //TODO
        },
        HLOOKUP: function HLOOKUP(expr) {
            //TODO
        },        
    };

    function evaluate(node, context) {

        switch (node.type) {

            case 'ArrayExpression':
                return evaluateArray(node.elements, context);

            case 'BinaryExpression':
                return evaluateBinop(node.operator, evaluate(node.left, context), evaluate(node.right, context));

            case 'CallExpression':
                var caller, fn;
                if (node.callee.type === 'MemberExpression') {
                    var arr = evaluateMember(node.callee, context);
                    caller = arr[0];
                    fn = arr[1];
                } else {
                    fn = evaluate(node.callee, contextFunctions);
                }
                if (typeof fn !== 'function') return undefined;
                return fn.apply(caller, evaluateArray(node.arguments, context));

            case 'ConditionalExpression':
                return evaluate(node.test, context)
                    ? evaluate(node.consequent, context)
                    : evaluate(node.alternate, context);

            case 'Identifier':
                return context[node.name];

            case 'Literal':
                if (node.raw === '@') return context['$ROW$'];
            case 'NumberLiteral':
            case 'StringLiteral':
                return node.value;

            case 'LogicalExpression':
                return evaluateBinop(node.operator, evaluate(node.left, context), evaluate(node.right, context));

            case 'MemberExpression':
                return evaluateMember(node, context)[1];

            case 'ThisExpression':
                return context;

            case 'UnaryExpression':
                return evaluateUnop(node.operator, evaluate(node.argument, context));

            default:
                return undefined;
        }
    }

    try {
        if (expr instanceof Array) {
            return expr.map(function (e) {
                return evaluate(e, doc); 
            });
        } else return evaluate(expr, doc);
    } catch (e) {
        throw new Error("Error while evaluating expression: " + (expr.expr || JSON.stringify(expr, null, 4)) 
            + "\nfor document " + JSON.stringify(doc, null, 4)
            + "\nCaused by: " + e + "\n" + e.stack);
    }
}

/**
 * TODO: make sure this function uses the same string comparison as CouchDB (see: http://docs.couchdb.org/en/2.1.1/ddocs/views/collation.html)
 * @param k1 string[]
 * @param k2 string[]
 */
export function compareKeys(k1: string[], k2: string[]): number {
    return compareKeysES5(k1, k2);
}

export function includesKey(key: string[], startKey: string[], endKey: string[], inclusive_start: boolean, inclusive_end: boolean) {
    let compareToStartKey = compareKeys(startKey, key);
    let compareToEndKey = compareKeys(key, endKey);
    let gtStartKey = inclusive_start ? compareToStartKey <= 0 : compareToStartKey < 0;
    let ltEndKey = inclusive_end ? compareToEndKey <= 0 : compareToStartKey < 0;
    return  gtStartKey && ltEndKey;
}

function compareStringsES5(s1, s2) {
    if (s1 === null && s2 != null) {
        return -1;
    } else if (s1 != null && s2 === null) {
        return 1
    } else return s1 < s2 ? -1 : s1 === s2 ? 0 : 1;
}
function compareKeysES5(k1, k2) {
    if (!(k1 instanceof Array) || !(k2 instanceof Array)) throw new Error("keys must be string arrays: " + JSON.stringify(k1) + "/" + JSON.stringify(k2));

    if (k1.length === 0) {
        if (k2.length === 0) return 0;
        else return -1;
    } else if (k2.length === 0) return 1;
    
    let ret = compareStringsES5(k1[0], k2[0]),
        i = 1;
    while (0 === ret && i < k1.length && i < k2.length) {
        ret = compareStringsES5(k1[i], k2[i]);
    }
    if (0 === ret) {
        if (k1.length > k2.length) ret = 1
        else if (k1.length < k2.length) ret = -1
    }
    return ret;
}
export function matchesTypeES5(obj, type) {
    throw new Error("matchesPathES5 not implemented");
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getFuncParamNames(func): string[] {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function generateMapFunctionAndQuery(args: MapFunctionAndQueryT): string {
    return packMapFunctionAndQuery(
        function (doc) {
            if (doc._id.match('^' + args.entityName))
                emit(['trid', evalExpression(doc, args.keyExpr)],
                    evalExpression(doc, args.valueExpr));
        }, [evalExpression], args);
}

export function packMapFunctionAndQuery(mapFunc: (doc, ...a) => void, dependencies: [(...a) => any], args: MapFunctionAndQueryT): string {
    return packFunction(mapFunc, dependencies, args);
}
export function packFunction(func: (doc, ...a) => void, dependencies: ((...a) => any | void)[], args: any): string {
    function getDepName(dep) {
        return dep.toString().match(/function\s+(\w+)\s*\(/)[1];
    }
    func.toString().match(/(args\.\w+)/g)!.forEach(argName => {
        if (!args[argName.replace(/^args\./, '')]) throw new Error(func.toString() + ' missing parameter: ' + argName);
    });

    let deps = dependencies.map(x => ({ n: getDepName(x), f: x.toString().replace(/\n/g, "\n        ") }));
    return [
        'function packedFunc(doc) {',
        '    var dependencies = {',
        '        ' + deps.map(({ n, f }) => n + ': ' + f).join(',\n        '),
        '    };',
        '    var args = ' + JSON.stringify(args, null, 4).replace(/\n/g, "\n    "),
        '    ' + func.toString()
            .replace(/function.*?\{/, 'function zaFunc(doc, dependencies) {')
            .replace(/\w+\.emit\s*\(/g, (m, $1) => 'emit(')
            .replace(/(?:\w+\.)?(\w+ES5)/g, (m, $1) => 'dependencies.' + $1)
            .replace(/\n/g, "\n    "),
        '    zaFunc(doc, dependencies);',
        '}',
    ].join('\n').replace(/\r/g, '');
}
export const PackedMapFunctions = {
    mapByKeyArrayExpression1: (map: MapFunctionT) => {
        let args = map;
        function map1(doc) {
            var id = parseDataObjIdES5(doc._id);
            if (id && id.entityName === args.entityName) {
                emit(evalExpression({$ROW$: doc}, args.keyExpr), evalExpression({$ROW$: doc}, args.valueExpr));
            }
        }
        return packFunction(map1, [parseDataObjIdES5, evalExpression], args);        
    },
    mapByKeyArrayExpression2: (map: MapFunctionT) => {
        let args = map;
        function map1(doc) {
            var id = parseDataObjIdES5(doc._id);
            if (id && id.entityName === args.entityName) {
                emit(evalExpression(doc, args.keyExpr), evalExpression(doc, args.valueExpr));
            }
        }
        return packFunction(map1, [parseDataObjIdES5, evalExpression], args);
    }
}

export function parseDataObjIdES5(_id) {
    if (!_id) return null;
    var m = _id.match(/^([\w_]+)~~([-_\w]+)$/);
    if (null != m) {
        return {
            entityName: m[1]!,
            id: m[0]!,
            uid: m[2],
        };
    } else return null;
}
export function makeDataObjId(entityName, _id) {
    return entityName + ':' + _id;
}
