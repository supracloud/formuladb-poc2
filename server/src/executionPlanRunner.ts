import { StoreViewAtTransaction } from "./transactionalStore";
import { BaseObj } from "../../src/app/domain/base_obj";

export class ExecutionPlanRunner {
    constructor(private storageService: StoreViewAtTransaction) {}
}
