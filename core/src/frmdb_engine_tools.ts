/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { FormulaValidation, Pn } from "@core/domain/metadata/entity";
import { SchemaDAO } from "@core/domain/metadata/schema_dao";
import { DataObj, parseDataObjId } from "@core/domain/metadata/data_obj";

import * as _ from 'lodash';
import { evalExprES5 } from "./map_reduce_utils";


export interface FailedValidation {
    validationFullName: string;
    validation: FormulaValidation;
    obsObj: DataObj;
}

export interface FailedTypeValidation {
    entityName: string,
    propertyName: string,
    obj: DataObj,
    propertyValue: any
}

export class FrmdbEngineTools {

    constructor(public schemaDAO: SchemaDAO) {
    }

    public cleanupPropertyTypes(obj: DataObj): DataObj {
        // if (!obj._rev) return obj;

        let entityName = parseDataObjId(obj._id).entityName;
        for (let key of Object.keys(obj)) {
            let property = this.schemaDAO.getProperty(entityName, key);
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

    public validateObjPropertyType(obj: DataObj, propertyName: string, propertyValue: string): FailedTypeValidation[] {
        if (propertyName === '_id' || propertyName === '_rev') return [];
        if (propertyValue == null) return [];

        let entityName = parseDataObjId(obj._id).entityName;
        let property = this.schemaDAO.getProperty(entityName, propertyName);
        if (!property) return [];
        switch (property.propType_) {
            case Pn.NUMBER:
                if ((propertyValue + '').match(/^[\d.]+$/) == null) {
                    return [{ entityName, propertyName, obj, propertyValue }];
                }
                break;
        }
        return [];
    }

    public validateObj(obsNew: DataObj): FailedValidation[] {
        let obsEntityName = parseDataObjId(obsNew._id).entityName;
        let failedValidations: FailedValidation[] = [];
        let validations = this.schemaDAO.getValidations(obsNew._id);
        for (let vEntry of _.entries(validations)) {
            let [validationName, validation] = vEntry;
            if (evalExprES5(obsNew, validation.conditionExpr) == false) {
                failedValidations.push({
                    obsObj: obsNew,
                    validation: validation,
                    validationFullName: obsEntityName + '!' + validationName,
                });
            }
        }
        return failedValidations;
    }

}
