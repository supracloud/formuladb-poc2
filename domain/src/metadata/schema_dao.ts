/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Schema, Pn, Entity, EntityProperty, FormulaValidation, AutoCorrectionOnValidationFailed } from "./entity";
import { parseDataObjId } from "./data_obj";
import { CompiledFormula } from "./execution_plan";
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

    public getFormulas(objId: string): CompiledFormula[] {
        let ret: CompiledFormula[] = [];
        let entity = this.getEntityForDataObj(objId);
        if (!entity) {console.warn("Entity does not exist", objId); return []}
        _.values(entity.props).forEach(pr => {
            if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                if (pr.compiledFormula_.triggers && pr.compiledFormula_.triggers.length > 0) ret.push(pr.compiledFormula_);
            }
        })
        return ret;
    }

    public getSelfFormulas(objId: string): CompiledFormula[] {
        let entityName = parseDataObjId(objId).entityName;
        let ret: CompiledFormula[] = [];
        let entity = this.schema.entities[entityName];
        for (let pr of Object.values(entity.props)) {
            if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                if (pr.compiledFormula_.targetEntityName === entityName && !pr.compiledFormula_.triggers) {
                    ret.push(pr.compiledFormula_);
                }
            }
        }
        return ret;
    }

    public getValidationsForEntity(entityName: string): _.Dictionary<FormulaValidation> | undefined {
        return this.schema.entities[entityName].validations;
    }
    public getValidations(objId: string): _.Dictionary<FormulaValidation> | undefined {
        let entityName = parseDataObjId(objId).entityName;
        return this.getValidationsForEntity(entityName);
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
