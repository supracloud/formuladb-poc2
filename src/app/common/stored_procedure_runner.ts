import { FrmdbStore } from "./frmdb_store";
import { BaseObj, SubObj } from "./domain/base_obj";
import * as _ from "lodash";
import * as moment from "moment";


export type CompiledStoredProcedure = (context: any) => Promise<any>;

export class StoredProcedureRunner {
    constructor(private frmdbStore: FrmdbStore) {}
}
