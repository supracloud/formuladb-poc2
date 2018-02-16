import { SubObj } from "../base_obj";

export class ExecutionPlan {
    RESOLVE_REFS?: '';
    FOREACH?: {relativePath: string, nested: ExecutionPlan[]};
    EVAL_EXPRESSIONS?: '';
    SAVE_DIRTY_OBJECTS?: '';
}
