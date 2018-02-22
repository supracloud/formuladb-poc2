import { FrmdbStore } from "./frmdb_store";
import { BaseObj, SubObj } from "./domain/base_obj";
import * as _ from "lodash";
import * as moment from "moment";
import { ExecutionPlan } from "./domain/metadata/execution_plan";

export class ExecutionPlanRunner {
    constructor(private executionPlan: ExecutionPlan, private storageService: FrmdbStore) {}

    runExecutionPlanOnDataChange(dataObj: BaseObj) {
        //triggers are sorted topologically based on observable/observer dependencies
    }
}
