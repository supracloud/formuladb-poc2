/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Schema, Pn, Entity, EntityProperty, FormulaValidation, AutoCorrectionOnValidationFailed } from "./entity";
import { parseDataObjId } from "./data_obj";
import { CompiledFormula } from "@storage/domain/metadata/execution_plan";
import * as _ from "lodash";
import { DAG } from "./dag";

export interface FormulaTriggeredByObj {
    entityName: string;
    propertyName: string;
    formula: CompiledFormula;
}

export class SchemaDAO {

    constructor(public schema: Schema, public formulaDAG: DAG<{id: string, entityProp: EntityProperty}>) {}

    public entities() {
        return _.values(this.schema.entities);
    }

    public getSelfFormulas(objId: string): CompiledFormula[] {
        let entityName = parseDataObjId(objId).entityName;
        let ret: CompiledFormula[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    if (pr.compiledFormula_.targetEntityName === en._id && pr.compiledFormula_.targetEntityName === entityName && !pr.compiledFormula_.triggers) {
                        ret.push(pr.compiledFormula_);
                    }
                }
            })
        });
        return ret;
    }

    public getValidations(objId: string): _.Dictionary<FormulaValidation> | undefined {
        let entityName = parseDataObjId(objId).entityName;
        return this.schema.entities[entityName].validations;
    }

    public getProperty(entityName: string, propertyName: string): EntityProperty {
        return this.schema.entities[entityName].props[propertyName];
    }

    public getEntityForDataObj(id: string) {
        let entityName = parseDataObjId(id).entityName;
        return this.schema.entities[entityName];
    }

    public getAutoCorrections(objId: string, validationFullName: string): AutoCorrectionOnValidationFailed[] {
        let entityName = parseDataObjId(objId).entityName;
        let autoCorrections = this.schema.entities[entityName].autoCorrectionsOnValidationFailed;
        if (autoCorrections != null) {
            return autoCorrections[validationFullName];
        } else {
            return [];
        }
    }
    public getFormulasTriggeredByObj(objId: string): FormulaTriggeredByObj[] {
        let entityName = parseDataObjId(objId).entityName;
        let ret: FormulaTriggeredByObj[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    let compiledFormula: CompiledFormula = pr.compiledFormula_;
                    
                    for (let t of (pr.compiledFormula_.triggers ||[])) {
                        if (t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName === entityName) {
                            ret.push({
                                entityName: en._id,
                                propertyName: pr.name,
                                formula: compiledFormula,
                            });
                            break;
                        }
                    }
                }
            })
        });
        return ret;
    }
    public getObsViewNamesUpdatedByObj(objId: string): string[] {
        let entityName = parseDataObjId(objId).entityName;
        let ret: string[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    let compiledFormula: CompiledFormula = pr.compiledFormula_;
                    
                    for (let t of (pr.compiledFormula_.triggers ||[])) {
                        if (t.mapObserversImpactedByOneObservable.entityName === entityName) {
                            ret.push(t.mapObserversImpactedByOneObservable.obsViewName);
                        }
                    }
                }
            })
        });
        return ret;
    }
}
