import { BaseObj, BaseObjPropTypes, isReservedPropName, SubObj, parseDeepPath, RESERVED_PROP_NAMES } from '../base_obj';
import { ExecutionPlan } from "./execution_plan";
import * as _ from 'lodash';
import { getES5, emit } from '../map_reduce_utils';


//FIXME: find a way to fix this! It should be possible say that an object has a set of properties and the rest can be of type X
// perhaps when this gets added: https://github.com/Microsoft/TypeScript/issues/4183
export type EntityPropsType = EntityProperty | BaseObjPropTypes;
export type SchemaPropsType = Entity | BaseObjPropTypes;

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export class Entity extends BaseObj {
    type_ = 'Entity_';
    module_?: boolean;
    aliases_?: {[aliasName: string]: string};
    [x: string]: EntityPropsType;
}
export type EntityPropertiesWithNames = { name: string, prop: EntityProperty }[];
export type EntityProperties = { [x: string]: EntityProperty };
export type HasProperties = Entity | SubTableProperty | SubEntityProperty;
export type EntityDeepPath = string;

export class Schema extends BaseObj {
    readonly _id: 'FRMDB_SCHEMA';
    [x: string]: SchemaPropsType;
    executionPlan_?: ExecutionPlan;
}

export function isEntityProperty(prop: EntityPropsType): prop is EntityProperty {
    return typeof prop == 'object' && prop['propType_'] != null;
}
export function propertiesOfEntity(entity: HasProperties): EntityProperties {
    let ret = {};
    _.toPairs(entity).forEach(([propName, prop]) => {
        if (!isEntityProperty(prop)) return;
        ret[propName] = prop;
    });
    ret['_id'] = { propType_: Pn.STRING };
    return ret;
}
export function propertiesWithNamesOf(entity: HasProperties): EntityPropertiesWithNames {
    let ret = [];
    _.toPairs(entity).forEach(([propName, prop]) => {
        if (!isEntityProperty(prop)) return;
        ret.push({ name: propName, prop: prop });
    });
    return ret.concat({ name: '_id', prop: { propType_: Pn.STRING } });
}
export function extendEntityProperties(extendedEntity: HasProperties, newProperties: EntityProperties) {
    _.toPairs(newProperties).forEach(([propName, p]) => {
        if (isReservedPropName(propName)) return;
        extendedEntity[propName] = p;
    });
}
export function queryEntityWithDeepPath(entity: Entity, deepPath: EntityDeepPath): EntityProperties {
    let relativePath = deepPath.replace(entity._id, '').replace(/^\//, '').replace(/\/@/g, '');
    if (null != relativePath && '' !== relativePath) {
        let pathInsideEntity = relativePath.replace(/\//, '.');
        return _(eval(`entity.${pathInsideEntity}`)).omit(RESERVED_PROP_NAMES).extend({ _id: { propType_: Pn.STRING } }).value() as EntityProperties;
    }
    return propertiesOfEntity(entity);
}

export function getEntityIdFromDeepPath(deepPath: EntityDeepPath) {
    return parseDeepPath(deepPath).path;
}

export const enum Pn {
    NUMBER = "NUMBER",
    STRING = "STRING",
    TEXT = "TEXT",
    DATETIME = "DATETIME",
    SUB_TABLE = "SUB_TABLE",
    BELONGS_TO = "BELONGS_TO",
    SUB_ENTITY = "SUB_ENTITY",
    FORMULA = "FORMULA",
}

export class NumberProperty extends SubObj {
    readonly propType_: Pn.NUMBER;
    //name: string;
    defaultValue?: number;
    allowNull?: boolean;
}
export class StringProperty extends SubObj {
    readonly propType_: Pn.STRING;
    //name: string;
    defaultValue?: string;
    allowNull?: boolean;
}
export class TextProperty extends SubObj {
    readonly propType_: Pn.TEXT;
    //name: string;
    allowNull?: boolean;
}
export class DatetimeProperty extends SubObj {
    readonly propType_: Pn.DATETIME;
    //name: string;
    allowNull?: boolean;
}

/**
 * Table of existing entities or entities created
 */
export class SubTableProperty extends SubObj {
    readonly propType_: Pn.SUB_TABLE;
    //name: string;
    deepPath?: string;
    snapshotCurrentValueOfProperties?: string[];
    foreignKey?: string;
    isLargeTable?: boolean;
    [x: string]: EntityPropsType;
}

/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class SubEntityProperty extends SubObj {
    readonly propType_: Pn.SUB_ENTITY;
    deepPath?: string;
    [x: string]: EntityPropsType;
}

export class BelongsToProperty extends SubObj {
    readonly propType_: Pn.BELONGS_TO;
    deepPath: string;
    snapshotCurrentValueOfProperties: string[];
    foreignKey: string;
}


export type SimpleExpression = string;//only simple arithmetic expressions with identifiers
export type FormulaExpression = string;

/**
 * This property represents a formula definition
 */
export class FormulaProperty extends SubObj {
    readonly propType_: Pn.FORMULA;
    //name: string;
    formula: FormulaExpression;
    postConditions?: SubObj;
}

export type EntityProperty =
    | NumberProperty
    | StringProperty
    | TextProperty
    | DatetimeProperty
    | SubTableProperty
    | SubEntityProperty
    | BelongsToProperty
    | FormulaProperty
    ;
