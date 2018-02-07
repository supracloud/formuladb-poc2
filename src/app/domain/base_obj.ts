import { KeyValueObj } from "./key_value_obj";


export class BaseObj extends KeyValueObj{
    type_?: string;
    created_?: string;
    updated_?: string;
    updated_by_?: string;
    rev_?: string;

    //list of transactions for this object
    log_?: string[];
    trs_?: Map<string, {
        id_: string,
        diff: any,
        state: 'BEGIN' | 'PRE_COMMIT' | 'COMMIT'
    }>;
}
