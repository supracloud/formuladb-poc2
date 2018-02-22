import { SubObj } from "../base_obj";
import { DataObjDeepPath, QueryDeepPath, QueryDeepPathTemplate } from "../metadata/data_obj";
import { SimpleExpression } from "./entity";

export class Trigger {
    viewName: string;
    observableFromObserver: QueryDeepPathTemplate;
    observerFromObservable: QueryDeepPathTemplate;
    map?: string;//by default = emit(observerFromObservable, getWithDeepPathES5(observable, observableFromObserver))
    mapExprFromObservable?: string;//no mapReduce required, just expression evaluation on the observer object
    reduce?: string;
    queryOptsFromObserver?: {
        keyTemplate?: string[],
        startkeyTemplate?: string[],
        endkeyTemplate?: string[],
    };
    autoCorrectOnValidationFailed?: {
        [validationSelector: string]: [{ var: string, op: '=' | '-=' | '+=', val: SimpleExpression }];
    }
}

export type CompiledFunction = {
    triggers: Trigger[];
    expr: SimpleExpression;
    validations?: {
        [name: string]: { conditionExpr: string, returnValueExpr: string }
    }
};

type CompiledFunctionSubObj = CompiledFunction & SubObj;
/**
 * each entity property that has "observers" gets a "trigger" that is called when that property changes
 */
export class ExecutionPlan extends SubObj {
    [formulaDeepPath: string]: CompiledFunctionSubObj | string;
}
