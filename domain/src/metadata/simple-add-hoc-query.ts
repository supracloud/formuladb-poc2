
type NumberFilterT = 'equals' | 'notEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'inRange';
type TextFilterT = 'equals' | 'notEqual' | 'contains' | 'notContains' | 'startsWith' | 'endsWith';

export interface FilterItem {
    filterType: 'text' | 'number';
    type: NumberFilterT | TextFilterT;
    filter: string;
    filterTo?: string;
}

export interface ValidationState {
    error?: string;
}
export type AggFunc = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'first' | 'last';

export interface ColumnParams {
    field: string;
    aggFunc: AggFunc;
}

export interface SimpleAddHocQuery {
    startRow: number;
    endRow: number;
    rowGroupCols: {
        field: string;
    }[];
    valueCols: ColumnParams[];
    pivotCols: ColumnParams[];
    pivotMode: boolean;
    groupKeys: string[];
    filterModel: {
        [x: string]: FilterItem;
    };
    sortModel: any;
}
