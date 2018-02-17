import { SubObj } from "../base_obj";

export const enum En { 
    STORE_getDataObj           = 'STORE_getDataObj'        ,
    STORE_queryWithDeepPath    = 'STORE_queryWithDeepPath' ,
    STORE_setObj               = 'STORE_setObj'            ,
    EVAL                       = 'EVAL'                    ,
}

/**
 * each entity property that has "observers" gets a "trigger" that is called when that property changes
 */
export type ExecutionPlan = SubObj;
