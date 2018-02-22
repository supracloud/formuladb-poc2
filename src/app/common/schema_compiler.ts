import * as _ from "lodash";
import * as jsep from 'jsep';

import { Entity, Schema, Pn, propertiesWithNamesOf, extendEntityProperties, queryEntityWithDeepPath, getEntityIdFromDeepPath, FormulaProperty, FormulaExpression } from "./domain/metadata/entity";
import { FrmdbStore } from "./frmdb_store";
import { isReservedPropName } from "./domain/base_obj";
import { CompiledFunction, Trigger } from "./domain/metadata/execution_plan";
import { DataObjDeepPath, DataObjRelativePath } from "./domain/metadata/data_obj";

/**
 * The compiler must produce execution plans for entities
 */
export class SchemaCompiler {
    constructor(private schema: Schema) {
    }

    public compileSchema(): Schema {
        _.toPairs(this.schema).forEach(([propName, entity]: [string, Entity]) => {
            if (isReservedPropName(propName)) return;
            this.compileEntity(entity);
        });
        return this.schema;
    }

    public typeCheck(formula: string) {

    }

    private compileEntity(entity: Entity): Entity {
        this.applyInheritanceTo(entity);
        // this.addReferenceTables(entity);

        //TODO: add [_id, type_] mandatory properties if they are missing

        //TODO: add [_id, type_] mandatory snapshotCurrentValueOfProperties if they are missing

        // create execution plan
        this.compileFormulas(entity);

        //TODO: detect cycles in observables/observers
        //TODO: sort triggers topologically

        return entity;
    }

    public static compileFormula(propDeepPath: DataObjDeepPath, formula: FormulaExpression): CompiledFunction {
        let triggers: Trigger[] = [];
        jsep.addUnaryOp('@');

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
            return list.map((v) => evaluate(v, context));
        }

        function evaluateMember(node, context) {
            const object = evaluate(node.object, context);
            if (node.computed) {
                return [object, object[evaluate(node.property, context)]];
            } else {
                return [object, object[node.property.name]];
            }
        }

        function evaluate(node, context) {

            switch (node.type) {

                case 'ArrayExpression':
                    return evaluateArray(node.elements, context);

                case 'BinaryExpression':
                    return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

                case 'CallExpression':
                    let caller, fn;
                    if (node.callee.type === 'MemberExpression') {
                        [caller, fn] = evaluateMember(node.callee, context);
                    } else {
                        fn = evaluate(node.callee, context);
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
                    return node.value;

                case 'LogicalExpression':
                    return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

                case 'MemberExpression':
                    return evaluateMember(node, context)[1];

                case 'ThisExpression':
                    return context;

                case 'UnaryExpression':
                    return unops[node.operator](evaluate(node.argument, context));

                default:
                    return undefined;
            }

        }

        return {
            triggers: triggers
        } as CompiledFunction;
    }

    public translateRelativePath(relativeDeepPath: DataObjRelativePath) {
        return null;
    }

    public compileFormulas(entity: Entity): Entity {
        return entity;
    }

    public addReferenceTables(entity: Entity): Entity {
        throw new Error('addReferenceTables not implemented');
    }
    public applyInheritanceTo(entity: Entity): Entity {
        propertiesWithNamesOf(entity).forEach(async pn => {
            if ((pn.prop.propType_ === Pn.SUB_ENTITY || pn.prop.propType_ === Pn.SUB_TABLE) && pn.prop.deepPath != null) {
                let referencedEntity = this.schema[getEntityIdFromDeepPath(pn.prop.deepPath)] as Entity;
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.prop.deepPath);
                extendEntityProperties(pn.prop, queryEntityWithDeepPath(referencedEntity, pn.prop.deepPath));
            }
        });
        return entity;
    }
}

function f2s(f: (...args) => any) {
    return function ret(...args) {
        return f.name + '(' + args.join(',') + ')';
    }
}
export const Fn = {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // map-reduce functions
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //== define ranges, simple ranges are Entity.property ==============================================================================
    GROUP_BY: f2s(function GROUP_BY(entityName, groupExpr1, groupExpr2?, groupExpr3?, groupExpr4?) { }),
    IF: f2s(function IF(entityName, expr1, expr2?, expr3?, expr4?) { }),

    //== aggregate/reduce functions ====================================================================================================
    SUM: f2s(function SUM(entityName) { }),
    SUMIF: f2s(function SUMIF(entityName, booleanExpr) { }),
    COUNT: f2s(function COUNT(entityName) { }),
    COUNTIF: f2s(function COUNTIF(entityName, booleanExpr) { }),
    TEXTJOIN: f2s(function TEXTJOIN(entityName) { }),

    //== Lookup functions ==============================================================================================================
    MATCH: f2s(function MATCH(range, expr) { }),

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // simple scalar functions
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    TEXT: f2s(function TEXT(expr, format) { }),
    EOMONTH: f2s(function EOMONTH(expr, numMonths) { }),
}

export const FUNCTIONS = {
    SUM: {
        staticTypeChecker: function staticTypeChecker() {

        },
        executionPlanTriggerCodeGenerator: function executionPlanTriggerCodeGenerator() {

        },
        observablesQueryCodeGenerator: function observablesQueryCodeGenerator() {

        },
        getPreviousValueCodeGenerator: function getPreviousValueCodeGenerator() {

        }
    }
}
