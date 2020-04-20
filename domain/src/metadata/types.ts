import { EntityProperty, Pn, Entity, Schema, FormulaProperty } from "./entity";
import { DataObj, entityNameFromDataObjId } from "./data_obj";
import { isLogicalExpression } from "jsep";

export function validateAndCovertObjPropertyType(obj: DataObj, entity: Entity, propertyName: string, propertyValue: string | number | boolean, skipConversion?: boolean): string | null {
    if (propertyName === '_id' || propertyName === '_rev') return null;
    if (propertyValue == null) return null;

    let property = entity.props[propertyName];
    if (!property) return null;
    switch (property.propType_) {
        case Pn.NUMBER:
            if ((propertyValue + '').match(/^\d+(\.\d+)?$/) == null) {
                return `Number expected for ${entity._id}.${propertyName} = ${propertyValue}`;
            } else if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            } 
            if (!skipConversion) {
                if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
            }
            break;
        case Pn.TEXT:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.BOOLEAN:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.DOCUMENT:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.DATETIME:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.ACTION:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.IMAGE:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            }                
            break;
        case Pn.ATTACHMENT:
            break;
        case Pn.CHILD_TABLE:
            break;
        case Pn.REFERENCE_TO:
            if (property.required === true && propertyValue == '') {
                return `Value is mandatory`;
            } else if (propertyValue != '') {
                // BACKEND_SERVICE().getDataObj()
                //TODO check reference exists in DB!
            }
            break;
        case Pn.HLOOKUP:
            if (property.actualPropType_ === Pn.NUMBER) {
                if ((propertyValue + '').match(/^\d+(\.\d+)?$/) == null) {
                    return `Number expected for ${entity._id}.${propertyName} = ${propertyValue}`;
                } else if (property.required === true && propertyValue == '') {
                    return `Value is mandatory`;
                } 
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
                }    
            }
            break;
        case Pn.EXTENDS_ENTITY:
            break;
        case Pn.FORMULA:
            let retType = property.returnType_;
            if (!retType) retType = tempInferTypeForFormula(property.formula);
            if (retType === Pn.NUMBER) {
                if ((propertyValue + '').match(/^\d+(\.\d+)?$/) == null) {
                    return `Number expected for ${entity._id}.${propertyName} = ${propertyValue}`;
                }
                if (!skipConversion) {
                    if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
                }    
            }
            break;
    }

    return null;
}

export function validateAndConvertObjFields(obj: DataObj, entity: Entity, skipConversion?: boolean): string | null {
    for (let prop of Object.values(entity.props)) {
        let errMsg = validateAndCovertObjPropertyType(obj, entity, prop.name, obj[prop.name], skipConversion);
        if (errMsg) return `${prop.name} is invalid: ${errMsg}`;
    }
    return null;
}

/** enhance compiler to extract real type from the formula expression */
export function tempInferTypeForFormula(formula: string): Pn.NUMBER | Pn.TEXT | Pn.BOOLEAN {
    if (formula.match(/SUMIF|COUNTIF|[+*]/)) return Pn.NUMBER;
    else return Pn.TEXT;
}