import { Entity, Schema, Pn, propertiesWithNamesOf, extendEntityProperties, queryEntityWithDeepPath, getEntityIdFromDeepPath } from "./domain/metadata/entity";
import * as _ from "lodash";
import { FrmdbStore } from "./frmdb_store";
import { isReservedPropName } from "./domain/base_obj";

/**
 * The compiler must produce execution plans for entities
 */
export class SchemaCompiler {
    constructor(private schema: Schema) {
    }

    public compileSchema(): Schema {
        _.toPairs(this.schema).forEach(([propName, entity]: [string, Entity]) => {
            if (isReservedPropName(propName)) return;
            this.compileEntity(entity);
        });
        return this.schema;
    }

    public typeCheck(formula: string) {

    }

    private compileEntity(entity: Entity): Entity {
        this.applyInheritanceTo(entity);
        // this.addReferenceTables(entity);

        //TODO: add [_id, type_] mandatory properties if they are missing
        
        //TODO: add [_id, type_] mandatory snapshotCurrentValueOfProperties if they are missing

        // create execution plan
        this.compileFormulas(entity);

        //TODO: detect cycles in observables/observers
        //TODO: sort triggers topologically

        return entity;
    }

    public compileFormulas(entity: Entity): Entity {
        return entity;
    }

    public addReferenceTables(entity: Entity): Entity {
        throw new Error('addReferenceTables not implemented');
    }
    public applyInheritanceTo(entity: Entity): Entity {
        propertiesWithNamesOf(entity).forEach(async pn => {
            if (((pn.prop.propType_ === Pn.SUB_ENTITY && null != pn.prop.foreignKey) || pn.prop.propType_ === Pn.TABLE) && pn.prop.deepPath != null) {
                let referencedEntity = this.schema[getEntityIdFromDeepPath(pn.prop.deepPath)] as Entity;
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.prop.deepPath);
                extendEntityProperties(pn.prop, queryEntityWithDeepPath(referencedEntity, pn.prop.deepPath));
            }
        });
        return entity;
    }
}


export const FUNCTIONS = {
    SUM: {
        staticTypeChecker: function () {

        },
        executionPlanTriggerCodeGenerator: function () {

        },
        observablesQueryCodeGenerator: function() {

        },
        getPreviousValueCodeGenerator: function () {

        }
    }
}
