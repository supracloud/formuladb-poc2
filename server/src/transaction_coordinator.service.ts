import { StorageService } from "./storage.service";
import { FormulaExecutionService } from "./formula_execution.service";
import * as events from "../../src/app/domain/event";

export class TransactionCoordinatorService {
    private formulaExecutionService: FormulaExecutionService;
    constructor(private storageService: StorageService) {
        this.formulaExecutionService = new FormulaExecutionService(this.storageService);
    }

    public performTransaction(event: events.MwzEvents) {
        //get objects
    }
}