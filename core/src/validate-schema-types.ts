import { Pn, Entity, Schema, ScalarFormulaProperty } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";
import { FailedValidation } from "@domain/errors";
import { getActualType } from "./formula_types_utils";
import { isNumericColumnTypes } from "@domain/metadata/types";

export function validateAndCovertObjPropertyType(obj: DataObj, entity: Entity, propertyName: string, propertyValue: string | number | boolean, schema: Schema, skipConversion?: boolean): FailedValidation[] {
    if (propertyName === '_id' || propertyName === '_rev') return [];
    if (propertyValue == null) return [];

    let ret: FailedValidation = {
        tableName: entity._id,
        invalidColName: propertyName,
        obj,
    };

    let property = entity.props[propertyName];
    if (!property) return [];
    switch (property.propType_) {
        case Pn.INPUT:
            switch(property.actualType.name) {
            case "NumberType":
                if ((propertyValue + '').match(/^-?\d+(\.\d+)?$/) == null) {
                    return [{...ret, errorMessage: `is not a number`}];
                } else if (property.required === true && propertyValue == '') {
                    return [{...ret, errorMessage: `is required`}];
                } 
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
                }
                break;
            case "TextType":
            case "TextEnumType":
            case "RichTextType":
                if (property.required === true && propertyValue == '') {
                    return [{...ret, errorMessage: `is required`}];
                }                
                break;
            case "BooleanType":
                if (property.required === true && (propertyValue == null || propertyValue == "")) {
                    return [{...ret, errorMessage: `is required`}];
                }
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = (propertyValue.toLowerCase() === "true");
                }
                break;
            case "DatetimeType":
                if (property.required === true && propertyValue == '') {
                    return [{...ret, errorMessage: `is required`}];
                }                
                break;
            case "MediaType":
                if (property.required === true && propertyValue == '') {
                    return [{...ret, errorMessage: `is required`}];
                }                
                break;
            }
        case Pn.TRIGGER:
            if (property.required === true && propertyValue == '') {
                return [{...ret, errorMessage: `is required`}];
            }                
            break;
        case Pn.CHILD_TABLE:
            break;
        case Pn.REFERENCE_TO:
            if (property.required === true && propertyValue == '') {
                return [{...ret, errorMessage: `is required`}];
            } else if (propertyValue != '') {
                // BACKEND_SERVICE().getDataObj()
                //TODO check reference exists in DB!
            }
            break;
        case Pn.HLOOKUP:
            if (propertyValue != null && propertyValue != "" && getActualType(schema, entity._id, propertyName).name === "NumberType") {
                if ((propertyValue + '').match(/^-?\d+(\.\d+)?$/) == null) {
                    return [{...ret, errorMessage: `is not a number`}];
                } else if (property.required === true && propertyValue == '') {
                    return [{...ret, errorMessage: `is required`}];
                } 
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
                }    
            }
            break;
        case Pn.SCALAR_FORMULA:
        case Pn.AGGREGATE_FORMULA:
            let retType = property.returnType_;
            if (!retType) {
                throw new Error(`Formula ${entity._id}.${property.name} = ${property.formula} not compiled yet!`);
            }
            if (propertyValue == null || propertyValue == "") {
                if (Pn.AGGREGATE_FORMULA == property.propType_ && isNumericColumnTypes(retType)) {
                    if (!skipConversion) {
                        obj[propertyName] = 0;
                    }
                } else if (property.required) {
                    return [{...ret, errorMessage: `is required`}];
                }
            } else if (isNumericColumnTypes(retType)) {
                if ((propertyValue + '').match(/^-?\d+(\.\d+)?$/) == null) {
                    return [{...ret, errorMessage: `is not a number`}];
                }
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
                }    
            }
            break;
    }

    return [];
}

export function validateAndConvertObjFields(obj: DataObj, entity: Entity, schema: Schema, skipConversion?: boolean): FailedValidation[] {
    for (let prop of Object.values(entity.props)) {
        let errs = validateAndCovertObjPropertyType(obj, entity, prop.name, obj[prop.name], schema, skipConversion);
        if (errs.length > 0) return errs;
    }
    return [];
}
