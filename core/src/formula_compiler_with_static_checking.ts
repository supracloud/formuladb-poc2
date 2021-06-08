import { Entity, EntityProperty, isScalarFormulaProperty, isAggregateFormulaProperty, Schema, ScalarFormulaProperty, AggregateFormulaProperty, isComputedRecordEntity, ComputedRecordValueProperty } from "@domain/metadata/entity";
import { FormulaStaticCheckerTokenizer } from "./formula_static_checker_tokenizer";
import { compileFormula } from "./formula_compiler";
import { isAggregateValueTypes, isScalarValueTypes, AggregateValueTypeNames, 
    ScalarValueTypeNames, 
    AggregateValueTypes,
    ScalarValueTypes,
    FormulaReturnTypes,
    isFormulaReturnTypes,
    FunctionReturnTypeNames} from "@domain/metadata/types";
import { CompiledFormula } from "@domain/metadata/execution_plan";
import { astNodeReturnType } from "@domain/metadata/expressions";
import { Expression } from "jsep";

const CompiledFormulasCache: {[formula: string]: {
    timestamp: number;
    counter: number;
}} = {};

function checkCacheForCircularDependencies(formula: string) {
    let compiledBefore = CompiledFormulasCache[formula];
    if (!compiledBefore) {
        CompiledFormulasCache[formula] = {
            timestamp: new Date().getTime(),
            counter: 0,
        };
    } else {
        let currentTime = new Date().getTime();
        if (currentTime - compiledBefore.timestamp < 200 && compiledBefore.counter > 2) {
            throw new Error(`Formula ${formula} gets compiled in a loop`);
        } else {
            CompiledFormulasCache[formula] = {
                timestamp: new Date().getTime(),
                counter: 0,
            };
        }
    }
}


export function getFormulaReturnType(ast: Expression): FormulaReturnTypes | string {
    let retTypes = astNodeReturnType(ast).types;
    if (retTypes.length > 1) {
        return `Formula ${ast.origExpr} return type is not well defined, it can return multiple types: ${retTypes.map(r => r.name).join(' | ')}`;
    } else if (!retTypes || retTypes.length == 0) {
        return `Formula ${ast.origExpr} return type is unknown`;
    } else if (!isFormulaReturnTypes(retTypes[0]!)) {
        return `Expected return type of ${ast.origExpr} to be ${FunctionReturnTypeNames.join(' | ')} but found ${retTypes[0].name}`;
    }
    return retTypes[0];
}

export function compileScalarFormula(schema: Schema, entity: Entity, prop: ScalarFormulaProperty) {
    let {compiledFormula_, returnType_} = compileFormulaWithStaticCheck(schema, entity._id, prop.name, prop.formula);
    prop.compiledFormula_ = compiledFormula_;
    if (isScalarValueTypes(returnType_)) prop.returnType_ = returnType_;
    else throw new Error(`Single Record Formula ${prop.formula} must not contain rollup functions, for table ${entity._id} column ${prop.name}`);
}

export function compileAggregateFormula(schema: Schema, entity: Entity, prop: AggregateFormulaProperty) {
    let {compiledFormula_, returnType_} = compileFormulaWithStaticCheck(schema, entity._id, prop.name, prop.formula);
    prop.compiledFormula_ = compiledFormula_;
    if (isAggregateValueTypes(returnType_)) prop.returnType_ = returnType_;
    else throw new Error(`Rollup formula ${prop.formula} must contain one function, for table ${entity._id} column ${prop.name}`);
}

export function compileComputedRecordEntity(schema: Schema, entity: Entity) {
    if (isComputedRecordEntity(entity)) {
        let idComputedProp = entity.props._id;
        let {compiledFormula_, returnType_} = compileFormulaWithStaticCheck(
            schema, idComputedProp.referencedEntityName, idComputedProp.name, idComputedProp.formula);
        idComputedProp.compiledFormula_ = compiledFormula_;
        if (isScalarValueTypes(returnType_)) idComputedProp.returnType_ = returnType_;
        else throw new Error(`GROUP_RECORD formula ${idComputedProp.formula} must not contain rollup functions, for table ${entity._id}`);
    } else throw new Error(`compileComputedRecordEntity called for table ${entity._id} and _id is not COMPUTED_RECORD`);
}

export function compileComputedRecordValueProperty(schema: Schema, entity: Entity, prop: ComputedRecordValueProperty) {
    if (isComputedRecordEntity(entity)) {
        let {compiledFormula_, returnType_} = compileFormulaWithStaticCheck(
            schema, entity.props._id.referencedEntityName, prop.name, prop.formula);
        prop.compiledFormula_ = compiledFormula_;
        if (isScalarValueTypes(returnType_)) prop.returnType_ = returnType_;
        else throw new Error(`GROUP_RECORD_VALUE formula ${prop.formula} must not contain rollup functions, for table ${entity._id} column ${prop.name}`);
    } else throw new Error(`COMPUTED_RECORD_VALUE found for table ${entity._id} but _id is not a COMPUTED_RECORD`);
}

export function compileFormulaWithStaticCheck(schema: Schema, targetEntityName: string, propertyName: string, formula: string): 
    {compiledFormula_: CompiledFormula, returnType_: ScalarValueTypes | AggregateValueTypes } 
{
    checkCacheForCircularDependencies(formula);

    let staticChecker = new FormulaStaticCheckerTokenizer(schema, targetEntityName, propertyName, formula);
    if (staticChecker.errors.length > 0) {
        throw new Error("Errors compiling formula " + formula + ' >>> ' + staticChecker.errors.join("; "));
    }
    let formulaRetType = getFormulaReturnType(staticChecker.ast);
    if (typeof formulaRetType === "string") {
        throw new Error("Errors getting formula return type: " + formulaRetType + "; " + staticChecker.errors.join("; "));
    }
    let compiledFormula_ = compileFormula(targetEntityName, propertyName, formula);
    if (isAggregateValueTypes(formulaRetType) || isScalarValueTypes(formulaRetType)) {
        let returnType_ = formulaRetType;
        return {compiledFormula_, returnType_};
    } else {
        throw new Error(`Expected formula return type to be ${AggregateValueTypeNames.join('|')} or ${ScalarValueTypeNames.join('|')} but found ${formulaRetType.name}`);
    }
}