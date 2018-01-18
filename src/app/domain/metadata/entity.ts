import { BaseObj } from '../base_obj';
import { PromiseType } from 'protractor/built/plugins';

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export class Entity extends BaseObj {
    mwzType = 'Entity_';
    properties: EntityProperty[] = [];
    module?: boolean;
}

export const enum PropertyTypeN { 
    NUMBER = "NUMBER",
    STRING = "STRING",
    TEXT = "TEXT",
    DATETIME = "DATETIME",
    TABLE = "TABLE",
    SUBENTITY = "SUBENTITY",
    FORMULA = "FORMULA",
}

export class NumberProperty {
    readonly type: PropertyTypeN.NUMBER;
    name: string;
    allowNull?:boolean;
}
export class StringProperty {
    readonly type: PropertyTypeN.STRING;
    name: string;
    allowNull?:boolean;
}
export class TextProperty {
    readonly type: PropertyTypeN.TEXT;
    name: string;
    allowNull?:boolean;
}
export class DatetimeProperty {
    readonly type: PropertyTypeN.DATETIME;
    name: string;
    allowNull?:boolean;
}

/**
 * Table of existing entities or entities created
 */
export class TableProperty {
    readonly type: PropertyTypeN.TABLE;
    name: string;
    referencedEntity?: ReferencedEntity;
    isLargeTable?: boolean;
    properties?: EntityProperty[];    
}
/**
 * This property represents an embedded entity that is created when the parent entity is created
 */
export class SubentityProperty {
    readonly type: PropertyTypeN.SUBENTITY;
    name: string;
    /**
     * referencedEntity != null means a new Entity instance is not created with the parent Entity
     * Autocomplete form element must be used to allow the user to reference and existing Entity
     * The possible autocomplete fields are set copiedProperties
     */
    referencedEntity?: ReferencedEntity;
    properties?: EntityProperty[]; 
}

export class ReferencedEntity {
    path: string;
    copiedProperties?: string[];
}

/**
 * This property represents a formula definition
 */
export class FormulaProperty {
    readonly type: PropertyTypeN.FORMULA;
    name: string;
    formula: Formula;
}

export type EntityProperty = 
    | NumberProperty
    | StringProperty
    | TextProperty
    | DatetimeProperty
    | TableProperty
    | SubentityProperty
    | FormulaProperty
;

export const enum FormulaTypeN {
    CONSTANT = "CONSTANT",
    VALUE_OF = "VALUE_OF",
    CURRENT_VALUE_OF = "CURRENT_VALUE_OF",
    SUM = "SUM",
    SUBTRACT = "SUBTRACT",
    MULTIPLY = "MULTIPLY",
    DIVIDE = "DIVIDE",
    CONCATENATE = "CONCATENATE",
    IF = "IF",
    CHAIN = "CHAIN",
    FORMAT = "FORMAT",
}

export class ConstantFormula {
    readonly type = FormulaTypeN.CONSTANT;
    value: any;
}

export class ValueOfFormula {
    readonly type = FormulaTypeN.VALUE_OF;
    relativePath: string;
}

export class CurrentValueOfFormula {
    readonly type = FormulaTypeN.CURRENT_VALUE_OF;
    relativePath: string;
}

export class SumFormula {
    readonly type = FormulaTypeN.SUM;
    arguments: Formula[];
}

export class SubtractFormula {
    readonly type = FormulaTypeN.SUBTRACT;
    minuend: Formula;
    subtrahends: Formula[];
}

export class MultiplyFormula {
    readonly type = FormulaTypeN.MULTIPLY;
}

export class DivideFormula {
    readonly type = FormulaTypeN.DIVIDE;
}

export class ConcatenateFormula {
    readonly type = FormulaTypeN.CONCATENATE;
    arguments: Formula[];
}

export class IfFormula {
    readonly type = FormulaTypeN.IF;
    expression: Formula;
    trueValue: Formula;
    falseValue: Formula;
}

export class ChainFormula {
    readonly type = FormulaTypeN.CHAIN;
    steps: {formula: Formula, alias?: string}[];
}

export class FormatFormula {
    readonly type = FormulaTypeN.FORMAT;
    format: string;
    values: Formula[];
}

export type Formula = 
    | ConstantFormula
    | ValueOfFormula
    | CurrentValueOfFormula
    | SumFormula
    | SubtractFormula
    | MultiplyFormula
    | DivideFormula
    | ConcatenateFormula
    | IfFormula
    | ChainFormula
    | FormatFormula
;
