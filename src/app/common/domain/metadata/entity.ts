import { BaseObj, BaseObjPropTypes, isNonOverridableProperty, SubObj, parseDeepPath, RESERVED_PROP_NAMES } from '../base_obj';
import { Formula } from "./formula";
import { ExecutionPlan } from "./execution_plan";
import * as _ from 'lodash';

export type EntityPropsType = EntityProperty | BaseObjPropTypes;

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export class Entity extends BaseObj {
    type_ = 'Entity_';
    module_?: boolean;
    [x: string]: EntityPropsType;
    executionPlan_?: ExecutionPlan;
}
export type EntityPropertiesWithNames = { name: string, prop: EntityProperty }[];
export type EntityProperties = { [x: string]: EntityProperty };
export type HasProperties = Entity | TableProperty | ExtendEntityProperty;

export function isEntityProperty(prop: EntityPropsType): prop is EntityProperty {
    return typeof prop == 'object' && prop['propType_'] != null;
}
export function propertiesOfEntity(entity: HasProperties): EntityProperties {
    let ret = {};
    _.toPairs(entity).forEach(([propName, prop]) => {
        if (!isEntityProperty(prop)) return;
        ret[propName] = prop;
    });
    ret['_id'] = {propType_: PropertyTypeN.STRING};
    return ret;
}
export function propertiesWithNamesOf(entity: HasProperties): EntityPropertiesWithNames {
    let ret = [];
    _.toPairs(entity).forEach(([propName, prop]) => {
        if (!isEntityProperty(prop)) return;
        ret.push({name: propName, prop: prop});
    });
    return ret.concat({name: '_id', prop: {propType_: PropertyTypeN.STRING}});
}
export function extendEntityProperties(extendedEntity: HasProperties, newProperties: EntityProperties) {
    _.toPairs(newProperties).forEach(([propName, p]) => {
        if (isNonOverridableProperty(propName)) return;
        extendedEntity[propName] = p;
    });
}
export function queryEntityWithDeepPath(entity: Entity, deepPath: string): EntityProperties {
    let relativePath = deepPath.replace(entity._id, '').replace(/^\//, '').replace(/\/@/g, '');
    if (null != relativePath && '' !== relativePath) {  
        let pathInsideEntity = relativePath.replace(/\//, '.');
        return _(eval(`entity.${pathInsideEntity}`)).omit(RESERVED_PROP_NAMES).extend({_id: {propType_: PropertyTypeN.STRING}}).value() as EntityProperties;
    }
    return propertiesOfEntity(entity);
}

export function getEntityIdFromDeepPath(deepPath: string) {
    return parseDeepPath(deepPath).path;
}

export function typesafeDeepPath<E extends HasProperties>(rootPath: string, e: E, propName: keyof E, arrayMarker?: '@') {
    return rootPath + '/' + propName + (arrayMarker ? '/@' : '');
}

export const enum PropertyTypeN { 
    NUMBER = "NUMBER",
    STRING = "STRING",
    TEXT = "TEXT",
    DATETIME = "DATETIME",
    TABLE = "TABLE",
    REFERENCE_ENTITY = "REFERENCES_ENTITY",
    EXTEND_ENTITY = "EXTENDS_ENTITY",
    FORMULA = "FORMULA",
}

export class NumberProperty extends SubObj {
    readonly propType_: PropertyTypeN.NUMBER;
    //name: string;
    defaultValue?: number;
    allowNull?:boolean;
}
export class StringProperty extends SubObj {
    readonly propType_: PropertyTypeN.STRING;
    //name: string;
    defaultValue?: string;
    allowNull?:boolean;
}
export class TextProperty extends SubObj {
    readonly propType_: PropertyTypeN.TEXT;
    //name: string;
    allowNull?:boolean;
}
export class DatetimeProperty extends SubObj {
    readonly propType_: PropertyTypeN.DATETIME;
    //name: string;
    allowNull?:boolean;
}

/**
 * Table of existing entities or entities created
 */
export class TableProperty extends SubObj {
    readonly propType_: PropertyTypeN.TABLE;
    //name: string;
    entity?: ReferencedEntity;
    isLargeTable?: boolean;
    [x: string]: EntityPropsType;
}
/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class ReferenceEntityProperty extends SubObj {
    readonly propType_: PropertyTypeN.REFERENCE_ENTITY;
    //name: string;
    /**
     * Autocomplete form element must be used to allow the user to reference and existing Entity
     * The possible autocomplete fields are set copiedProperties
     */
    entity?: ReferencedEntity;
}
/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class ExtendEntityProperty extends SubObj {
    readonly propType_: PropertyTypeN.EXTEND_ENTITY;
    //name: string;
    /**
     * a new Entity instance is not created with the parent Entity
     */
    entity?: ReferencedEntity;
    [x: string]: EntityPropsType;
}

export class ReferencedEntity extends SubObj {
    deepPath: string;
    copiedProperties?: string[];
}

/**
 * This property represents a formula definition
 */
export class FormulaProperty extends SubObj {
    readonly propType_: PropertyTypeN.FORMULA;
    //name: string;
    formula: Formula;
}

export type EntityProperty = 
    | NumberProperty
    | StringProperty
    | TextProperty
    | DatetimeProperty
    | TableProperty
    | ReferenceEntityProperty
    | ExtendEntityProperty
    | FormulaProperty
;
