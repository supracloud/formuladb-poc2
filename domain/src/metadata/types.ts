import { EntityProperty, Pn, Entity } from "./entity";
import { DataObj, entityNameFromDataObjId } from "./data_obj";

export function validateAndCovertObjPropertyType(obj: DataObj, entity: Entity, propertyName: string, propertyValue: string | number | boolean): string | null {
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
            if (typeof propertyValue === "string") obj[propertyName] = parseFloat(propertyValue);
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
        case Pn.EXTENDS_ENTITY:
            break;
        case Pn.FORMULA:
            break;
    }

    return null;
}
