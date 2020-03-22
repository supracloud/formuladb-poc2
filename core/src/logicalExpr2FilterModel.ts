import { LogicalOpBinaryExpression, LogicalCallExpression, isLogicalOpBinaryExpression } from "./formula_compiler";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";

export function logicalExpr2FilterModel(filter: LogicalOpBinaryExpression | LogicalCallExpression): SimpleAddHocQuery['filterModel'] {
    let ret: SimpleAddHocQuery['filterModel'] = {};
    if (isLogicalOpBinaryExpression(filter)) {
        
    }

    return ret;
}