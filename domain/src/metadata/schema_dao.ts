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
    entityId: string;
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
        let entityId = parseDataObjId(objId).entityId;
        let ret: CompiledFormula[] = [];
        let entity = this.schema.entities[entityId];
        for (let pr of Object.values(entity.props)) {
            if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                if (pr.compiledFormula_.targetEntityName === entityId && !pr.compiledFormula_.triggers) {
                    ret.push(pr.compiledFormula_);
                }
            }
        }
        return ret;
    }

    public getValidationsForEntity(entityId: string): _.Dictionary<FormulaValidation> | undefined {
        return this.schema.entities[entityId].validations;
    }
    public getValidations(objId: string): _.Dictionary<FormulaValidation> | undefined {
        let entityId = parseDataObjId(objId).entityId;
        return this.getValidationsForEntity(entityId);
    }

    public getProperty(entityId: string, propertyName: string): EntityProperty {
        return this.schema.entities[entityId].props[propertyName];
    }

    public getEntityForDataObj(id: string) {
        let entityId = parseDataObjId(id).entityId;
        return this.schema.entities[entityId];
    }

    public getAutoCorrections(objId: string, validationFullName: string): AutoCorrectionOnValidationFailed[] {
        let entityId = parseDataObjId(objId).entityId;
        let autoCorrections = this.schema.entities[entityId].autoCorrectionsOnValidationFailed;
        if (autoCorrections != null) {
            return autoCorrections[validationFullName];
        } else {
            return [];
        }
    }
    public getFormulasTriggeredByObj(objId: string): FormulaTriggeredByObj[] {
        let entityId = parseDataObjId(objId).entityId;
        let ret: FormulaTriggeredByObj[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    let compiledFormula: CompiledFormula = pr.compiledFormula_;
                    
                    for (let t of (pr.compiledFormula_.triggers ||[])) {
                        if (t.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId === entityId) {
                            ret.push({
                                entityId: en._id,
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
        let entityId = parseDataObjId(objId).entityId;
        let ret: string[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.FORMULA === pr.propType_ && null != pr.compiledFormula_) {
                    let compiledFormula: CompiledFormula = pr.compiledFormula_;
                    
                    for (let t of (pr.compiledFormula_.triggers ||[])) {
                        if (t.mapObserversImpactedByOneObservable.entityId === entityId) {
                            ret.push(t.mapObserversImpactedByOneObservable.obsViewName);
                        }
                    }
                }
            })
        });
        return ret;
    }
}
