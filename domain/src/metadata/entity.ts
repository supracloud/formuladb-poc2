/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, isReservedPropName, RESERVED_PROP_NAMES } from '@domain/key_value_obj';
import { CompiledFormula, CompiledScalar } from "./execution_plan";
import { BooleanCallExpression, BooleanBinaryExpression } from '@domain/metadata/expressions';
import { ColumnInputTypes, ScalarValueTypes, AggregateValueTypes } from './types';
import { DAG } from './dag';
import { DataObj } from './data_obj';

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export interface Entity extends DataObj {
    _id: string;
    pureNavGroupingChildren?: string[];
    description?: string;
    props: EntityProperties;
    stateGraph?: EntityStateGraph;
    isPresentationPage?: boolean;
    isEditable?: boolean;
}
export type ComputedRecordEntity = Entity & {props: {_id: ComputedRecordProperty}};
export function isComputedRecordEntity(param): param is ComputedRecordEntity {
    return isEntity(param) && param.props && param.props._id && param.props._id.propType_ === Pn.COMPUTED_RECORD;
}

export interface EntityStateGraph {
    nodes: string[];
    transitions: {source: string, target: string}[];
};

export type HasEntityProperties = Entity | ChildTableProperty;
export type EntityProperties = { [x: string]: EntityProperty };
export type EntityDeepPath = string;

export interface Schema extends DataObj {
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

export function referenceToPropsOf(entity: Entity): Map<string, ReferenceToProperty> {
    let referenceToProps: Map<string, ReferenceToProperty> = new Map();
    for (let prop of Object.values(entity?.props||{})) {
        if (prop.propType_ === Pn.REFERENCE_TO) referenceToProps.set(prop.name, prop);
    }
    return referenceToProps;
}

export const enum Pn {
    INPUT = "INPUT",
    KEY = "KEY",
    TRIGGER = "TRIGGER",
    CHILD_TABLE = "CHILD_TABLE",
    REFERENCE_TO = "REFERENCE_TO",
    HLOOKUP = "HLOOKUP",
    SCALAR_FORMULA = "SCALAR_FORMULA",
    AGGREGATE_FORMULA = "AGGREGATE_FORMULA",
    VALIDATE_RECORD = "VALIDATE_RECORD",
    AUTO_CORRECT = "AUTO_CORRECT",
    COMPUTED_RECORD = "COMPUTED_RECORD",
    COMPUTED_RECORD_VALUE = "COMPUTED_RECORD_VALUE",
}

export interface BaseProperty /*extends DataObj*/ {
    name: string;
    required?: boolean;
    description?: string;
    exampleValue?: string;
    lockEditing?: boolean;
}

export interface InputProperty extends BaseProperty {
    propType_: Pn.INPUT;
    actualType: ColumnInputTypes;
}
export function isInputProperty(param): param is InputProperty {
    return param != null && typeof param === 'object' && param.propType_ === Pn.INPUT;
}

export interface ActionProperty extends BaseProperty {
    propType_: Pn.TRIGGER;
    name: string;
    defaultValue?: string;
    required?: boolean;
}
export function isActionProperty(param): param is ActionProperty {
    return param != null && typeof param === 'object' && param.propType_ === Pn.TRIGGER;
}

/**
 * TablePage of existing entities or entities created
 */
export interface ChildTableProperty extends BaseProperty {
    propType_: Pn.CHILD_TABLE;
    name: string;
    referencedEntityName: string;
    isLargeTable?: boolean;
    props?: EntityProperties;
}
export function isChildTableProperty(param): param is ChildTableProperty {
    return param != null && typeof param === 'object' && param.propType_ === Pn.CHILD_TABLE;
}

export interface ReferenceToProperty extends BaseProperty {
    propType_: Pn.REFERENCE_TO;
    referencedEntityName: string;
}
export function isReferenceToProperty(param): param is ReferenceToProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.REFERENCE_TO;
}

export interface HlookupProperty extends BaseProperty {
    propType_: Pn.HLOOKUP;
    referenceToPropertyName: string;
    referencedPropertyName: string;
}
export function isHlookupProperty(param): param is HlookupProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.HLOOKUP;
}


export type FormulaExpression = string;

interface FormulaPropertyBase extends BaseProperty {
    formula: FormulaExpression;
    compiledFormula_?: CompiledFormula;
    dependsOn_?: {entity: Entity, property: EntityProperty}[];
}
/**
 * This property represents a formula definition
 */
export interface ScalarFormulaProperty extends FormulaPropertyBase {
    propType_: Pn.SCALAR_FORMULA;
    returnType_: ScalarValueTypes;
}
export function isScalarFormulaProperty(param): param is ScalarFormulaProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.SCALAR_FORMULA;
}

export interface AggregateFormulaProperty extends FormulaPropertyBase {
    propType_: Pn.AGGREGATE_FORMULA;
    returnType_: AggregateValueTypes;
}
export function isAggregateFormulaProperty(param): param is AggregateFormulaProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.AGGREGATE_FORMULA;
}

export interface KeyProperty extends BaseProperty {
    propType_: Pn.KEY;
    name: string;
    scalarFormula: FormulaExpression;
}
export function isKeyProperty(param): param is KeyProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.KEY;
}

export interface ComputedRecordProperty extends FormulaPropertyBase {
    propType_: Pn.COMPUTED_RECORD;
    name: string;
    referencedEntityName: string;
    returnType_: ScalarValueTypes;
}
export function isComputedRecordProperty(param): param is ComputedRecordProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.COMPUTED_RECORD;
}

export interface ComputedRecordValueProperty extends FormulaPropertyBase {
    propType_: Pn.COMPUTED_RECORD_VALUE;
    name: string;
    returnType_: ScalarValueTypes;
}
export function isComputedRecordValueProperty(param): param is ComputedRecordValueProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.COMPUTED_RECORD_VALUE;
}

export interface ValidateRecordProperty extends BaseProperty {
    propType_: Pn.VALIDATE_RECORD;
    name: string;
    scalarFormula: FormulaExpression;
    errorMessage?: string;
    params?: string[];
}
export function isValidateRecordProperty(param): param is ValidateRecordProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.VALIDATE_RECORD;
}

export interface AutoCorrectProperty extends BaseProperty {
    propType_: Pn.AUTO_CORRECT;
    name: string;
    targetPropertyName: string;
    scalarFormula: FormulaExpression;
    validationTableName: string;
    validationColName?: string;
}
export function isAutoCorrectProperty(param): param is AutoCorrectProperty {
    return param != null && typeof param === 'object' && param.propType_ == Pn.AUTO_CORRECT;
}

export type EntityProperty =
    | KeyProperty
    | InputProperty
    | ActionProperty
    | ScalarFormulaProperty
    | ReferenceToProperty
    | HlookupProperty
    | ValidateRecordProperty
    | AutoCorrectProperty
    | ChildTableProperty
    | AggregateFormulaProperty
    | ComputedRecordProperty
    | ComputedRecordValueProperty
;
