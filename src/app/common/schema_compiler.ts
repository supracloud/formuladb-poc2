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

    public compileEntity(entity: Entity): Entity {
        this.applyInheritanceTo(entity);

        //TODO: add [_id, type_] mandatory properties if they are missing
        
        //TODO: add [_id, type_] mandatory snapshotCurrentValueOfProperties if they are missing

        // create execution plan
        this.compileFormulas(entity);

        return entity;
    }

    public compileFormulas(entity: Entity): Entity {
        return entity;
    }

    public applyInheritanceTo(entity: Entity): Entity {
        propertiesWithNamesOf(entity).forEach(async pn => {
            if ((pn.prop.propType_ === Pn.EXTEND_ENTITY || pn.prop.propType_ === Pn.TABLE) && pn.prop.entity != null) {
                let referencedEntity = this.schema[getEntityIdFromDeepPath(pn.prop.entity.deepPath)] as Entity;
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.prop.entity.deepPath);
                extendEntityProperties(pn.prop, queryEntityWithDeepPath(referencedEntity, pn.prop.entity.deepPath));
            }
        });
        return entity;
    }
}


export const StaticTypeCheckers = {
    SUM: function () {

    },
}

export const ExecutionPlanTriggerGenerators = {
    SUM: function () {
        
    },
}

export const ObservablesQueryGenerators = {
    SUM: function () {
        
    },
}
