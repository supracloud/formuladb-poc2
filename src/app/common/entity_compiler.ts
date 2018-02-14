import { Entity, PropertyTypeN } from "./domain/metadata/entity";
import { extendEntityProperties, queryEntityPropertiesWithDeepPath, getEntityIdFromDeepPath } from "../domain.utils";
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
        _.toPairs(entity.properties).forEach(async ([propName, prop]) => {
            if ((prop.type === PropertyTypeN.EXTEND_ENTITY || prop.type === PropertyTypeN.TABLE) && prop.entity != null) {
                let referencedEntity = await this.frmdbStore.getEntity(getEntityIdFromDeepPath(prop.entity.deepPath));
                if (referencedEntity == null) throw new Error("Cannot find entity for " + prop.entity.deepPath);
                extendEntityProperties(prop.properties, queryEntityPropertiesWithDeepPath(referencedEntity.properties, prop.entity.deepPath));
            }
        });
    }
}
