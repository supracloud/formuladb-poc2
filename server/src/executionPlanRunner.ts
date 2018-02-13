import { StoreIsolatedAtTransaction } from "./transactionalStore";
import { BaseObj } from "../../src/app/common/domain/base_obj";

export class ExecutionPlanRunner {
    constructor(private storageService: StoreIsolatedAtTransaction) {}
}
