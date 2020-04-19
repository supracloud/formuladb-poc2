/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, isReservedPropName, RESERVED_PROP_NAMES } from '@domain/key_value_obj';
import { CompiledFormula, CompiledScalar } from "./execution_plan";
import * as _ from 'lodash';
import { Expression } from 'jsep';
import { LogicalCallExpression, LogicalOpBinaryExpression } from '@core/formula_compiler';

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export interface Entity extends KeyValueObj {
    _id: string;
    pureNavGroupingChildren?: string[];
    // aliases?: { [aliasName: string]: string };
    validations?: _.Dictionary<FormulaValidation>;
    autoCorrectionsOnValidationFailed?: _.Dictionary<AutoCorrectionOnValidationFailed[]>;
    props: EntityProperties;
    stateGraph?: EntityStateGraph;
    isPresentationPage?: boolean;
    isEditable?: boolean;
}

export interface EntityStateGraph {
    nodes: string[];
    transitions: {source: string, target: string}[];
};

export interface AutoCorrectionOnValidationFailed {
    targetPropertyName: string;
    autoCorrectExpr: Expression;
}
export class FormulaValidation {
    conditionExpr: Expression;
    rollback?: boolean;
}

export type HasEntityProperties = Entity | ChildTableProperty | ExtendsEntityProperty;
export type EntityProperties = { [x: string]: EntityProperty };
export type EntityDeepPath = string;
export interface Schema extends KeyValueObj {
    readonly _id: string;
    entities: { [x: string]: Entity };
}

export function isSchema(param): param is Schema {
    return param != null && typeof param === 'object' && param['_id']?.startsWith('FRMDB_SCHEMA~~') && param['entities'] != null;
}

export function isEntity(param): param is Entity {
    return param != null && typeof param === 'object' && param['_id'] != null && param['props'] != null;
}

export function isEntityProperty(param): param is EntityProperty {
    return param != null && typeof param === 'object' && param['propType_'] != null;
}

export function isPropertyWithProperties(param): param is ChildTableProperty | ExtendsEntityProperty {
    return isEntityProperty(param) && (param.propType_ === Pn.CHILD_TABLE || param.propType_ === Pn.EXTENDS_ENTITY);
}
export function extendEntityProperties(extendedEntity: HasEntityProperties, newProperties: EntityProperties) {
    _.toPairs(newProperties).forEach(([propName, p]) => {
        if (isReservedPropName(propName)) return;
        extendedEntity.props = extendedEntity.props || {};
        extendedEntity.props[propName] = p;
    });
}
export function queryEntityWithDeepPath(entity: Entity, referencedEntityName: EntityDeepPath): EntityProperties {
    let relativePath = referencedEntityName.replace(entity._id, '').replace(/^\//, '').replace(/\/@/g, '');
    if (null != relativePath && '' !== relativePath) {
        let pathInsideEntity = relativePath.replace(/\//, '.');
        return _(eval(`entity.${pathInsideEntity}`) as {}).omit(RESERVED_PROP_NAMES).extend({ _id: { name: "_id", propType_: Pn.TEXT } }).value() as EntityProperties;
    }
    return entity.props;
}


export const enum Pn {
    KEY = "KEY",
    NUMBER = "NUMBER",
    TEXT = "TEXT",
    BOOLEAN = "BOOLEAN",
    DOCUMENT = "DOCUMENT",
    DATETIME = "DATETIME",
    ACTION = "ACTION",
    IMAGE = "IMAGE",
    ATTACHMENT = "ATTACHMENT",
    CHILD_TABLE = "CHILD_TABLE",
    REFERENCE_TO = "REFERENCE_TO",
    EXTENDS_ENTITY = "SUB_ENTITY",
    FORMULA = "FORMULA",
}

export interface BaseProperty {
    name: string;
    required?: boolean;
}

export interface NumberProperty {
    propType_: Pn.NUMBER;
    name: string;
    format?: "default" | "currency" | "percentage";
    defaultValue?: number;
    required?: boolean;
}
export interface StringProperty {
    propType_: Pn.TEXT;
    name: string;
    defaultValue?: string;
    required?: boolean;
    enumValues?: string[];
}
export interface BooleanProperty {
    propType_: Pn.BOOLEAN;
    name: string;
    required?: boolean;
}
export interface DocumentProperty {
    propType_: Pn.DOCUMENT;
    name: string;
    required?: boolean;
}
export interface DatetimeProperty {
    propType_: Pn.DATETIME;
    name: string;
    timeMandatory?: boolean;
    required?: boolean;
}

export interface AttachmentProperty {
    propType_: Pn.ATTACHMENT;
    name: string;
    mediaType: "pdf" | "csv" | "docx" | "xlsx";
    url: string;
}

export interface ImageProperty {
    propType_: Pn.IMAGE;
    name: string;
    required?: boolean;
}

export interface ActionProperty {
    propType_: Pn.ACTION;
    name: string;
    defaultValue?: string;
    required?: boolean;
}

/**
 * TablePage of existing entities or entities created
 */
export interface ChildTableProperty {
    propType_: Pn.CHILD_TABLE;
    name: string;
    referencedEntityName: string;
    isLargeTable?: boolean;
    props?: EntityProperties;
}
export function isChildTableProperty(param): param is ChildTableProperty {
    return param != null && typeof param === 'object' && param.propType_ === Pn.CHILD_TABLE;
}


/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export interface ExtendsEntityProperty {
    propType_: Pn.EXTENDS_ENTITY;
    name: string;
    referencedEntityName: string;
    props: EntityProperties;
}
export function isSubEntityProperty(param): param is ExtendsEntityProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.EXTENDS_ENTITY;
}

export interface ReferenceToProperty extends BaseProperty {
    propType_: Pn.REFERENCE_TO;
    referencedEntityName: string;
    filter?: LogicalOpBinaryExpression | LogicalCallExpression;
}
export function isBelongsToProperty(param): param is ReferenceToProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.REFERENCE_TO;
}


export type FormulaExpression = string;

/**
 * This property represents a formula definition
 */
export interface FormulaProperty {
    propType_: Pn.FORMULA;
    name: string;
    formula: FormulaExpression;
    compiledFormula_?: CompiledFormula;
    returnType_?: Exclude<EntityProperty, FormulaProperty>;
}
export function isFormulaProperty(param): param is FormulaProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.FORMULA;
}

export interface KeyProperty {
    propType_: Pn.KEY;
    name: string;
    scalarFormula: FormulaExpression;
}
export function isKeyProperty(param): param is FormulaProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.KEY;
}


export type ScalarEntityProperty = 
    | KeyProperty
    | NumberProperty
    | StringProperty
    | BooleanProperty
    | DocumentProperty
    | DatetimeProperty
    | ActionProperty
    | AttachmentProperty
    | ImageProperty
    | FormulaProperty
;

export type EntityProperty =
    | ScalarEntityProperty
    | ChildTableProperty
    | ExtendsEntityProperty
    | ReferenceToProperty
;
