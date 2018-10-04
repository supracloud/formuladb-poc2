/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */



export interface IdRevObj {
    _id: string;
    _rev?: string;
}

export interface KeyValueObj extends IdRevObj {
    _deleted?: boolean;
}

export interface KeyValueError {
    /**
     * HTTP Status Code during HTTP or HTTP-like operations
     */
    status?: number;
    name?: string;
    message?: string;
    reason?: string;
    error?: string | boolean;
    id?: string;
    rev?: string;
}
export function isKeyValueError(param): param is KeyValueError {
    return param != null && typeof param === 'object' && typeof param.status === 'number' && typeof param.name === 'string' && typeof param.message === 'string';
}
