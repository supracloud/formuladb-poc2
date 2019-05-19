import { Expression } from "jsep";
import * as jsep from 'jsep';

export function $s2e(expr: string | Expression): Expression {
    let parsedExpr = typeof expr === 'string' ? jsep.parse(expr) : expr;
    return parsedExpr;
}
