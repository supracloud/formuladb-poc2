/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

// import { v4 } from 'uuid';
import * as shortUUID from 'short-uuid';

const uuid = shortUUID();

//IDs should use ASCII collation
export const MIN_TUUID = '                                    ';
export const MAX_TUUID = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~';

export function generateUUID(): string {
    return uuid.new();
}

export function generateTimestampUUID(): string {
    return Date.now() + '_' + generateUUID();
}
