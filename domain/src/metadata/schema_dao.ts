/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Schema, Pn, Entity, EntityProperty, ValidateRecordProperty, AutoCorrectProperty, ComputedRecordProperty, ComputedRecordEntity } from "./entity";
import { parseDataObjId } from "./data_obj";
import { CompiledFormula } from "./execution_plan";
import * as _ from "lodash";
import { DAG } from "./dag";
import { KeyValueObjIdType } from "@domain/key_value_obj";

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

    public getFormulas(objId: KeyValueObjIdType): CompiledFormula[] {
        let ret: CompiledFormula[] = [];
        let entity = this.getEntityForDataObj(objId);
        if (!entity) {console.warn("Entity does not exist", objId); return []}
        _.values(entity.props).forEach(pr => {
            if (Pn.SCALAR_FORMULA == pr.propType_ && null != pr.compiledFormula_ || Pn.AGGREGATE_FORMULA == pr.propType_ && null != pr.compiledFormula_) {
                if (pr.compiledFormula_.triggers && pr.compiledFormula_.triggers.length > 0) ret.push(pr.compiledFormula_);
            }
        })
        return ret;
    }

    public getSelfFormulas(objId: KeyValueObjIdType): CompiledFormula[] {
        let entityId = parseDataObjId(objId).entityId;
        let ret: CompiledFormula[] = [];
        let entity = this.schema.entities[entityId];
        for (let pr of Object.values(entity.props)) {
            if (Pn.SCALAR_FORMULA == pr.propType_ && null != pr.compiledFormula_) {
                if (pr.compiledFormula_.targetEntityName === entityId && !pr.compiledFormula_.triggers) {
                    ret.push(pr.compiledFormula_);
                }
            }
        }
        return ret;
    }

    public getValidationsForEntity(entityId: string): {[colName: string]: ValidateRecordProperty} {
        let ret: {[colName: string]: ValidateRecordProperty} = {};
        for (let prop of Object.values(this.schema.entities[entityId].props)) {
            if (prop.propType_ === Pn.VALIDATE_RECORD) {
                ret[prop.name] = prop;
            }
        } 
        return ret;
    }

    public getProperty(entityId: string, propertyName: string): EntityProperty {
        return this.schema.entities[entityId].props[propertyName];
    }

    public getEntityForDataObj(id: KeyValueObjIdType) {
        let entityId = parseDataObjId(id).entityId;
        return this.schema.entities[entityId];
    }

    public getAutoCorrections(objId: KeyValueObjIdType, validationTableName: string, validationColName?: string): {[colName: string]: AutoCorrectProperty} {
        let entityId = parseDataObjId(objId).entityId;
        let ret: {[colName: string]: AutoCorrectProperty} = {};
        for (let prop of Object.values(this.schema.entities[entityId].props)) {
            if (prop.propType_ === Pn.AUTO_CORRECT && prop.validationTableName == validationTableName && prop.validationColName == validationColName) {
                ret[prop.name] = prop;
            }
        } 
        return ret;
    }
    public getAggFormulasTriggeredByObj(objId: KeyValueObjIdType): FormulaTriggeredByObj[] {
        let entityId = parseDataObjId(objId).entityId;
        let ret: FormulaTriggeredByObj[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.AGGREGATE_FORMULA == pr.propType_) {
                    if (!pr.compiledFormula_) throw new Error(`formula not compiled yet ${entityId}.${pr.name} = ${pr.formula}`);
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
    public getComputedRecordsTriggeredByObj(objId: KeyValueObjIdType): ComputedRecordEntity[] {
        let entityId = parseDataObjId(objId).entityId;
        let ret: ComputedRecordEntity[] = [];
        for (let ent of this.entities()) {
            if (ent.props._id && ent.props._id.propType_ === Pn.COMPUTED_RECORD && ent.props._id.referencedEntityName == entityId) {
                ret.push(ent as ComputedRecordEntity);
            }
        }
        return ret;
    }
    public getObsViewNamesUpdatedByObj(objId: KeyValueObjIdType): string[] {
        let entityId = parseDataObjId(objId).entityId;
        let ret: string[] = [];
        this.entities().forEach(en => {
            _.values(en.props).forEach(pr => {
                if (Pn.SCALAR_FORMULA == pr.propType_ && null != pr.compiledFormula_ || Pn.AGGREGATE_FORMULA == pr.propType_ && null != pr.compiledFormula_) {
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
