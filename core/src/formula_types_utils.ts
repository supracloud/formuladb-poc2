import { Pn, Schema, referenceToPropsOf, AggregateFormulaProperty, ScalarFormulaProperty, EntityProperty, Entity, ReferenceToProperty, HlookupProperty } from "@domain/metadata/entity";
import { ColumnTypes } from "@domain/metadata/types";
import { _throw } from "./throw";
import { compileFormulaWithStaticCheck, compileScalarFormula, compileAggregateFormula, compileComputedRecordValueProperty, compileComputedRecordEntity } from "./formula_compiler_with_static_checking";

export function getReferencedTableAndColumFromHlookup(schema: Schema, entity: Entity, prop: HlookupProperty): {referencedEntity: Entity, referencedProp: EntityProperty} {
    let referenceToProps = referenceToPropsOf(entity);
    let refToProp = referenceToProps.get(prop.referenceToPropertyName);
    if (!refToProp) throw new Error(`getActualType, REFERENCE_TO column ${prop.referenceToPropertyName} not found in table ${entity._id} with columns ${Object.keys(entity.props).join(', ')}`);
    let referencedEntity = getReferenceToTable(schema, entity, refToProp);
    let referencedProp = referencedEntity.props[prop.referencedPropertyName];
    if (!refToProp) throw new Error(`getActualType, column ${prop.referencedPropertyName} referenced in HLOOKUP column ${prop.name} not found in referenced table ${referencedEntity._id} with columns ${Object.keys(referencedEntity.props).join(', ')}`);
    return {referencedEntity, referencedProp};
}

export function getReferenceToTable(schema: Schema, entity: Entity, refToProp: ReferenceToProperty): Entity {
    let referencedEntity = schema.entities[refToProp.referencedEntityName]
    if (!referencedEntity) throw new Error(`getActualType, table not found ${refToProp.referencedEntityName}, available tables are ${Object.keys(schema.entities).join(',')}`);
    return referencedEntity;
}

export function getActualType(schema: Schema, entityName: string, propertyName: string): ColumnTypes {
    let entity = schema.entities[entityName];
    if (!entity) throw new Error(`getActualType, table not found ${entityName} in schema ${JSON.stringify(schema)}`);
    let prop = entity.props[propertyName];
    if (!prop) throw new Error(`getActualType, column not found ${propertyName} in table ${JSON.stringify(entity)}`);
    switch (prop.propType_) {
        case Pn.INPUT: return prop.actualType;
        case Pn.KEY: return {name: "TextType"};
        case Pn.COMPUTED_RECORD: {
            if (prop.name != '_id') {
                throw new Error(`COMPUTED_RECORD was found for table ${entity._id} column ${prop.name}, but is allowed only for _id`);
            }
            if (!prop.returnType_) {
                compileComputedRecordEntity(schema, entity);
            }
            return prop.returnType_;
        }
        case Pn.COMPUTED_RECORD_VALUE: {
            if (!prop.returnType_) {
                compileComputedRecordValueProperty(schema, entity, prop)
            }
            return prop.returnType_;
        }
        case Pn.TRIGGER: return {name: "TriggerType"};
        case Pn.REFERENCE_TO: return {name: "TextType"};
        case Pn.HLOOKUP: {
            let {referencedEntity, referencedProp} = getReferencedTableAndColumFromHlookup(schema, entity, prop);
            return getActualType(schema, referencedEntity._id, referencedProp.name);
        }
        case Pn.SCALAR_FORMULA: {
            if (!prop.returnType_) {
                compileScalarFormula(schema, entity, prop);
            }
            return prop.returnType_;
        }
        case Pn.AGGREGATE_FORMULA: {
            if (!prop.returnType_) {
                compileAggregateFormula(schema, entity, prop);
            }
            if (prop.returnType_.name === "NumberAggType") return { name: "NumberType" };
            else if (prop.returnType_.name === "TextAggType") return { name: "TextType" };
            else throw new Error(`Unknown return type of formula ${prop.formula}, from table ${entity._id}`);
        }
        case Pn.VALIDATE_RECORD: return {name: "BooleanType"};
        case Pn.AUTO_CORRECT: return {name: "BooleanType"};
        case Pn.CHILD_TABLE: return {name: "MediaType"};
    }
}
