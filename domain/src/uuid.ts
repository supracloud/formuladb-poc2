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

const Base58 = require("base58");
const NODE_ID = 1;
let IndexPerMs = 0;
let CurrentMs = new Date().getTime();
export function generateShortUID() {
    let newMs = new Date().getTime();
    if (CurrentMs === newMs) IndexPerMs = IndexPerMs + 1;
    else { IndexPerMs = 0; CurrentMs = newMs; }
    return Base58.int_to_base58(CurrentMs) + Base58.int_to_base58(NODE_ID * 1000 + IndexPerMs);
}
export const generateShortTimestampedUID = generateShortUID;

export function generateUUID(): string {
    return uuid.new();
}

export function generateTimestampUUID(): string {
    return Date.now() + '_' + generateUUID();
}
