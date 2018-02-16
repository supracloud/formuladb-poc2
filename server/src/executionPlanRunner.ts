import { FrmdbStoreAtTransaction } from "./frmdbTransactionalStore";
import { BaseObj } from "../../src/app/common/domain/base_obj";

export class ExecutionPlanRunner {
    constructor(private storageService: FrmdbStoreAtTransaction) {}
}
