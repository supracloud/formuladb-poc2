import { Entity, PropertyTypeN, propertiesWithNamesOf, extendEntityProperties, queryEntityWithDeepPath, getEntityIdFromDeepPath } from "./domain/metadata/entity";
import * as _ from "lodash";
import { FrmdbStore } from "./frmdb_store";

/**
 * The compiler must produce execution plans for entities
 */
export class EntityCompiler {

    constructor(private frmdbStore: FrmdbStore) {

    }

    public async compileEntity(entity: Entity) {
        await this.applyInheritanceTo(entity);

        //TODO: add [_id, type_] mandatory properties if they are missing
        
        //TODO: add [_id, type_] mandatory copiedProperties if they are missing
    }

    public async applyInheritanceTo(entity: Entity) {
        propertiesWithNamesOf(entity).forEach(async pn => {
            if ((pn.prop.propType_ === PropertyTypeN.EXTEND_ENTITY || pn.prop.propType_ === PropertyTypeN.TABLE) && pn.prop.entity != null) {
                let referencedEntity = await this.frmdbStore.getEntity(getEntityIdFromDeepPath(pn.prop.entity.deepPath));
                if (referencedEntity == null) throw new Error("Cannot find entity for " + pn.prop.entity.deepPath);
                extendEntityProperties(pn.prop, queryEntityWithDeepPath(referencedEntity, pn.prop.entity.deepPath));
            }
        });
    }
}
