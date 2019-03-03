/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, isReservedPropName, RESERVED_PROP_NAMES } from '@core/domain/key_value_obj';
import { CompiledFormula } from "./execution_plan";
import * as _ from 'lodash';
import { Expression } from 'jsep';

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export interface Entity extends KeyValueObj {
    _id: string;
    pureNavGroupingChildren?: string[];
    isStaticPage?: boolean;
    aliases?: { [aliasName: string]: string };
    validations?: _.Dictionary<FormulaValidation>;
    autoCorrectionsOnValidationFailed?: _.Dictionary<AutoCorrectionOnValidationFailed[]>;
    props: EntityProperties;
    extendsEntityName?: string;
    stateGraph?: EntityStateGraph;
    isView?: boolean;
    isEditable?: boolean;

    // fromObjLiteral<T extends Pick<Entity, Exclude<keyof Entity, 'type_' | 'props' | 'fromObjLiteral'>> & {props: any}>(
    //     obj: T & {props: {readonly [x in keyof T['props']]: EntityProperty}}): Entity 
    // {
    //     Object.assign(this, obj);
    //     return this;
    // }
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
    readonly _id: 'FRMDB_SCHEMA';
    entities: { [x: string]: Entity };
}

export function isSchema(param): param is Schema {
    return param != null && typeof param === 'object' && param['_id'] == 'FRMDB_SCHEMA' && param['entities'] != null;
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
        extendedEntity.props[propName] = p;
    });
}
export function queryEntityWithDeepPath(entity: Entity, referencedEntityName: EntityDeepPath): EntityProperties {
    let relativePath = referencedEntityName.replace(entity._id, '').replace(/^\//, '').replace(/\/@/g, '');
    if (null != relativePath && '' !== relativePath) {
        let pathInsideEntity = relativePath.replace(/\//, '.');
        return _(eval(`entity.${pathInsideEntity}`)).omit(RESERVED_PROP_NAMES).extend({ _id: { name: "_id", propType_: Pn.STRING } }).value() as EntityProperties;
    }
    return entity.props;
}


export const enum Pn {
    NUMBER = "NUMBER",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    DOCUMENT = "TEXT",
    DATETIME = "DATETIME",
    DURATION = "DURATION",
    ATTACHMENT = "ATTACHMENT",
    CHILD_TABLE = "CHILD_TABLE",
    REFERENCE_TO = "REFERENCE_TO",
    EXTENDS_ENTITY = "SUB_ENTITY",
    FORMULA = "FORMULA",
}

export interface NumberProperty {
    propType_: Pn.NUMBER;
    name: string;
    defaultValue?: number;
    allowNull?: boolean;
}
export interface StringProperty {
    propType_: Pn.STRING;
    name: string;
    defaultValue?: string;
    allowNull?: boolean;
}
export interface BooleanProperty {
    propType_: Pn.BOOLEAN;
    name: string;
}
export interface DocumentProperty {
    propType_: Pn.DOCUMENT;
    name: string;
    allowNull?: boolean;
}
export interface DatetimeProperty {
    propType_: Pn.DATETIME;
    name: string;
    allowNull?: boolean;
}

export interface DurationProperty {
    propType_: Pn.DURATION;
    name: string;
    allowNull?: boolean;
}

export interface AttachmentProperty {
    propType_: Pn.ATTACHMENT;
    name: string;
    mediaType: "pdf" | "png" | "jpg" | "gif" | "csv" | "docx" | "xlsx";
    url: string;
}

/**
 * Table of existing entities or entities created
 */
export interface ChildTableProperty {
    propType_: Pn.CHILD_TABLE;
    name: string;
    referencedEntityName: string;
    isLargeTable?: boolean;
    props: EntityProperties;
}
export function isSubTableProperty(param): param is ChildTableProperty {
    return param != null && typeof param === 'object' && param.propType_ === Pn.CHILD_TABLE;
}


/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export interface ExtendsEntityProperty {
    propType_: Pn.EXTENDS_ENTITY;
    name: string;
    referencedEntityName?: string;
    props: EntityProperties;
}
export function isSubEntityProperty(param): param is ExtendsEntityProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.EXTENDS_ENTITY;
}

export interface ReferenceToProperty {
    propType_: Pn.REFERENCE_TO;
    name: string;
    referencedEntityName: string;
    referencedPropertyName: string;
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
}
export function isFormulaProperty(param): param is FormulaProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.FORMULA;
}

export type EntityProperty =
    | NumberProperty
    | StringProperty
    | DocumentProperty
    | DatetimeProperty
    | DurationProperty
    | AttachmentProperty
    | ChildTableProperty
    | ExtendsEntityProperty
    | ReferenceToProperty
    | FormulaProperty
    ;
