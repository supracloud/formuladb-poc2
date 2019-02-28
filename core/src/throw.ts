/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { isExpression } from "jsep";
import * as CircularJSON from "circular-json";

export function _throw<OUT>(msg: string, param1?, param2?): OUT {
    let p1 = param1 ? (isExpression(param1) ? param1.origExpr : CircularJSON.stringify(param1, null, 4)) : '';
    let p2 = param2 ? (isExpression(param2) ? param2.origExpr : CircularJSON.stringify(param2, null, 4)) : '';
    throw new Error(msg + p1 + "; " + p2);
}

export function _throwEx<OUT>(ex): OUT {
    throw ex;
}
