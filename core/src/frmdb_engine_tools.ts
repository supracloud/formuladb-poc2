/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { FormulaValidation, Pn } from "@domain/metadata/entity";
import { SchemaDAO } from "@domain/metadata/schema_dao";
import { DataObj, parseDataObjId, entityNameFromDataObjId } from "@domain/metadata/data_obj";

import * as _ from 'lodash';
import { evalExpression } from "@functions/map_reduce_utils";


export interface FailedValidation {
    validationFullName: string;
    validation: FormulaValidation;
    obsObj: DataObj;
}

export class FrmdbEngineTools {

    constructor(public schemaDAO: SchemaDAO) {
    }

    public cleanupPropertyTypes(obj: DataObj): DataObj {
        // if (!obj._rev) return obj;

        let entityId = entityNameFromDataObjId(obj._id);
        for (let key of Object.keys(obj)) {
            let property = this.schemaDAO.getProperty(entityId, key);
            if (!property) continue;
            switch (property.propType_) {
                case Pn.NUMBER:

                    if (typeof obj[key] != 'number') {
                        let num = parseInt(obj[key]);
                        if (num !== NaN) obj[key] = num;
                    }
                    break;
            }
        }
        return obj;
    }

    public validateObjPropertyType(obj: DataObj, propertyName: string, propertyValue: string): string | null {
        if (propertyName === '_id' || propertyName === '_rev') return null;
        if (propertyValue == null) return null;

        let entityId = entityNameFromDataObjId(obj._id);
        let property = this.schemaDAO.getProperty(entityId, propertyName);
        if (!property) return null;
        switch (property.propType_) {
            case Pn.NUMBER:
                if ((propertyValue + '').match(/^[\d.]+$/) == null) {
                    return `Number expected for ${entityId}.${propertyName} = ${propertyValue}`;
                } else if (property.required === true && propertyValue == '') {
                    return `Value is mandatory`;
                } 
                break;
            case Pn.STRING:
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
                break;
            case Pn.EXTENDS_ENTITY:
                break;
            case Pn.FORMULA:
                break;
        }

        return null;
    }

    public validateObj(obsNew: DataObj): string | null {
        let obsEntityName = entityNameFromDataObjId(obsNew._id);
        let validations = this.schemaDAO.getValidationsForEntity(obsEntityName);
        for (let vEntry of _.entries(validations)) {
            let [validationName, validation] = vEntry;
            if (evalExpression(obsNew, validation.conditionExpr) == false) {
                //THIS is not ok for computed columns since the correct values may not be available on the client side, they must be computed on the server first 
                //return `Validation ${validationName} failed! Table ${obsEntityName}, expression ${validation.conditionExpr} `;

                return null;
            }
        }
        return null;
    }

}
