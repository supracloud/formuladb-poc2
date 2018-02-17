import { SubObj } from "../base_obj";

export const enum En { 
    STORE_getDataObj           = 'STORE_getDataObj'        ,
    STORE_queryWithDeepPath    = 'STORE_queryWithDeepPath' ,
    STORE_setObj               = 'STORE_setObj'            ,
    EVAL                       = 'EVAL'                    ,
    DEF_MAP_FUN                = 'DEF_MAP_FUN'             ,
}

/**
 * each entity property that has "observers" gets a "trigger" that is called when that property changes
 */
export type ExecutionPlan = SubObj;
