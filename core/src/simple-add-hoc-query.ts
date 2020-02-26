import { SimpleAddHocQuery, AggFunc, SimpleAddHocQueryFilterItem } from "@domain/metadata/simple-add-hoc-query";
import * as _ from "lodash";

export async function simpleAdHocQueryOnArrayOfOBjects(query: SimpleAddHocQuery, objects: any[]): Promise<any[]> {
    let { rowGroupCols, groupKeys } = query;
    //First we filter the rows
    if (objects.length == 0) return [];

    rowGroupCols = rowGroupCols || {};
    groupKeys = groupKeys || [];
    
    //Then we group them
    if (rowGroupCols.length > groupKeys.length) {
        let rowGroupCol = rowGroupCols[groupKeys.length];
        let grouped = _.groupBy(objects, rowGroupCol.field);

        objects = [];
        for (let [_id, objs] of Object.entries(grouped)) {
            let obj: any = { [rowGroupCol.field]: _id };
            for (let groupAgg of query.valueCols) {
                obj[groupAgg.field.toLowerCase()] = objs.reduce((agg, currentObj) =>
                    ({
                        [groupAgg.field]: evaluateAggregation(currentObj[groupAgg.field], groupAgg.aggFunc, agg[groupAgg.field])
                    })
                )[groupAgg.field];
            }
            objects.push(obj);
        }
    }

    //Then we filter the groups
    let groupedFiltered: any[] = [];
    for (let obj of objects) {
        let matchesFilter: boolean = true;
        for (let [_id, filter] of Object.entries(query.filterModel)) {
            if (!evaluateFilter(obj[_id], filter)) {
                matchesFilter = false;
                break;
            }
        }
        if (matchesFilter) groupedFiltered.push(obj);
    }

    return groupedFiltered;
}

function evaluateAggregation(value: any, aggFunc: AggFunc, aggValue: any) {
    switch (aggFunc) {
        case "sum":
            return aggValue + value;
        case "count":
            return aggValue + 1;
        default: throw new Error('unknown agg func: ' + aggFunc);
    }
}


function evalNumberFilter(val, item: SimpleAddHocQueryFilterItem): boolean {
    switch (item.type) {
        case 'equals':
            return val == item.filter;
        case 'notEqual':
            return val != item.filter;
        case 'greaterThan':
            return val > item.filter;
        case 'greaterThanOrEqual':
            return val >= item.filter;
        case 'lessThan':
            return val < item.filter;
        case 'lessThanOrEqual':
            return val <= item.filter;
        case 'inRange':
            return val >= item.filter && val <= item.filterTo!;
        default:
            throw new Error('unknown number filter type: ' + item.type);
    }
}

function evalTextFilter(val: string, item: SimpleAddHocQueryFilterItem): boolean {
    switch (item.type) {
        case 'equals':
            return val == item.filter;
        case 'notEqual':
            return val != item.filter;
        case 'contains':
            return val.indexOf(item.filter) >= 0;
        case 'notContains':
            return val.indexOf(item.filter) < 0;
        case 'startsWith':
            return val.startsWith(item.filter);
        case 'endsWith':
            return val.endsWith(item.filter);
        default:
            throw new Error('unknown text filter type: ' + item.type);
    }
}
function evaluateFilter(value: any, filter: SimpleAddHocQueryFilterItem): boolean {
    switch (filter.filterType) {
        case 'text': return evalTextFilter(value, filter);
        case 'number': return evalNumberFilter(value, filter);
        default: throw new Error('unknown filter type: ' + filter.filterType);
    }
}
