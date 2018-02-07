import { BaseObj } from '../base_obj';
import { Formula } from "./formula";
import { ExecutionPlan } from "./execution_plan";

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export class Entity extends BaseObj {
    type_ = 'Entity_';
    module?: boolean;
    properties: {[x: string]: EntityProperty};
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

export class NumberProperty {
    readonly type: PropertyTypeN.NUMBER;
    //name: string;
    defaultValue?: number;
    allowNull?:boolean;
}
export class StringProperty {
    readonly type: PropertyTypeN.STRING;
    //name: string;
    defaultValue?: string;
    allowNull?:boolean;
}
export class TextProperty {
    readonly type: PropertyTypeN.TEXT;
    //name: string;
    allowNull?:boolean;
}
export class DatetimeProperty {
    readonly type: PropertyTypeN.DATETIME;
    //name: string;
    allowNull?:boolean;
}

/**
 * Table of existing entities or entities created
 */
export class TableProperty {
    readonly type: PropertyTypeN.TABLE;
    //name: string;
    entity?: ReferencedEntity;
    isLargeTable?: boolean;
    properties?: {[x: string]: EntityProperty};
}
/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class ReferenceEntityProperty {
    readonly type: PropertyTypeN.REFERENCE_ENTITY;
    //name: string;
    /**
     * Autocomplete form element must be used to allow the user to reference and existing Entity
     * The possible autocomplete fields are set copiedProperties
     */
    entity?: ReferencedEntity;
    properties?: {[x: string]: EntityProperty}; 
}
/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class ExtendEntityProperty {
    readonly type: PropertyTypeN.EXTEND_ENTITY;
    //name: string;
    /**
     * a new Entity instance is not created with the parent Entity
     */
    entity?: ReferencedEntity;
    properties?: {[x: string]: EntityProperty};
}

export class ReferencedEntity {
    deepPath: string;
    copiedProperties?: string[];
}

/**
 * This property represents a formula definition
 */
export class FormulaProperty {
    readonly type: PropertyTypeN.FORMULA;
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
