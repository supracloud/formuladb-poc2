import { Entity, Schema } from "./domain/metadata/entity";
import * as _ from "lodash";
import { FrmdbStore } from "./frmdb_store";

/**
 * The compiler must produce execution plans for entities
 */
export class FormulaCompiler {
    private schema: Schema;

    constructor(private frmdbStore: FrmdbStore) {

    }

}
