import { ReduceFun } from "./reduce_functions";
import { Expression } from "jsep";

type AddHocQueryExpressionColumnT = {alias: string, expr: Expression | Expression[]};
type AddHocQuerySubqueryColumnT = {alias: string, subquery: AddHocQuery};
type AddHocQueryColumnT = string | AddHocQueryExpressionColumnT | AddHocQuerySubqueryColumnT;

export interface AddHocQuery {
    filters: Expression[];
    extraColsBeforeGroup: AddHocQueryColumnT[];
    groupColumns: string[],
    groupAggs: {alias: string, reduceFun: ReduceFun, colName: string}[],
    groupFilters: Expression[];
    sortColumns: string[],
    returnedColumns: AddHocQueryColumnT[];
}

export function isExpressionColumn(col: AddHocQueryColumnT): col is AddHocQueryExpressionColumnT {
    return col['expr'] != null;
}

export function isSubqueryColumn(col: AddHocQueryColumnT): col is AddHocQuerySubqueryColumnT {
    return col['subquery'] != null;
}
