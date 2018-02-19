import { SubObj } from "../base_obj";
import { DataObjDeepPath } from "../metadata/data_obj";

/**
 * each entity property that has "observers" gets a "trigger" that is called when that property changes
 */
export class ExecutionPlan extends SubObj {
    triggers: DataObjDeepPath[][];
    formulas: { [path: string]: { observables: DataObjDeepPath, map: string, reduce: string } };
}
