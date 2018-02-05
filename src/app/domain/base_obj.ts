import { KeyValueObj } from "./key_value_obj";


export class BaseObj extends KeyValueObj{
    lastTrApplied_?: string;

    //list of transactions for this object
    log_?: string[];
    trs_?: Map<string, {
        id_: string,
        diff: any,
        state: 'BEGIN' | 'PRE_COMMIT' | 'COMMIT'
    }>;

}
