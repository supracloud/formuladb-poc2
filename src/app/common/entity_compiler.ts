import { Entity, Schema, Pn, propertiesWithNamesOf, extendEntityProperties, queryEntityWithDeepPath, getEntityIdFromDeepPath } from "./domain/metadata/entity";
import * as _ from "lodash";
import { FrmdbStore } from "./frmdb_store";

/**
 * The compiler must produce execution plans for entities
 */
export class EntityCompiler {
    private entitiesDag: Schema;

    constructor(private frmdbStore: FrmdbStore) {

    }

    public async compileEntity(entity: Entity): Promise<Entity> {
        await this.applyInheritanceTo(entity);

        //TODO: add [_id, type_] mandatory properties if they are missing
        
        //TODO: add [_id, type_] mandatory snapshotCurrentValueOfProperties if they are missing

        // create execution plan
        await this.compileFormulas(entity);

        return entity;
    }

    public async compileFormulas(entity: Entity): Promise<Entity> {

        

        return entity;
    }

    public async applyInheritanceTo(entity: Entity): Promise<Entity> {
        propertiesWithNamesOf(entity).forEach(async pn => {
            if ((pn.prop.propType_ === Pn.EXTEND_ENTITY || pn.prop.propType_ === Pn.TABLE) && pn.prop.entity != null) {
                let referencedEntity = await this.frmdbStore.getEntity(getEntityIdFromDeepPath(pn.prop.entity.deepPath));
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.prop.entity.deepPath);
                extendEntityProperties(pn.prop, queryEntityWithDeepPath(referencedEntity, pn.prop.entity.deepPath));
            }
        });
        return entity;
    }
}
