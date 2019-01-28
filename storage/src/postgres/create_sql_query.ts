export interface QueryRequest {
    startRow: number;
    endRow: number;
    rowGroupCols: ColumnParams[];
    valueCols: ColumnParams[];
    pivotCols: ColumnParams[];
    pivotMode: boolean;
    groupKeys: string[];
    filterModel: any;
    sortModel: any;
}
export interface ColumnParams {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}

export class CreateSqlQuery {

    public createSelectSql(req: QueryRequest) {
        let {rowGroupCols, valueCols, groupKeys} = req;
        if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
            let colsToSelect: string[] = [];

            let rowGroupCol = rowGroupCols[groupKeys.length];
            colsToSelect.push(rowGroupCol.field);

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
            });

            return ' select ' + colsToSelect.join(', ');
        } else {
            // select all columns
            return ' select *';
        }
    }

    public createFilterSql(key, item) {
        switch (item.filterType) {
            case 'text': return this.createTextFilterSql(key, item);
            case 'number': return this.createNumberFilterSql(key, item);
            default: throw new Error('unkonwn filter type: ' + item.filterType);
        }
    }

    public createNumberFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            default:
                console.log('unknown number filter type: ' + item.type);
                return 'true';
        }
    }

    public createTextFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = "' + item.filter + '"';
            case 'notEqual':
                return key + ' != "' + item.filter + '"';
            case 'contains':
                return key + ' like "%' + item.filter + '%"';
            case 'notContains':
                return key + ' not like "%' + item.filter + '%"';
            case 'startsWith':
                return key + ' like "' + item.filter + '%"';
            case 'endsWith':
                return key + ' like "%' + item.filter + '"';
            default:
                console.log('unknown text filter type: ' + item.type);
                return 'true';
        }
    }

    public createWhereSql(rowGroupCols, groupKeys, filterModel) {
        let that = this;
        let whereParts: string[] = [];

        if (groupKeys.length > 0) {
            groupKeys.forEach(function (key, index) {
                let colName = rowGroupCols[index].field;
                whereParts.push(colName + ' = "' + key + '"')
            });
        }

        if (filterModel) {
            let keySet = Object.keys(filterModel);
            keySet.forEach(function (key) {
                let item = filterModel[key];
                whereParts.push(that.createFilterSql(key, item));
            });
        }

        if (whereParts.length > 0) {
            return ' where ' + whereParts.join(' and ');
        } else {
            return '';
        }
    }

    public createGroupBySql(rowGroupCols, groupKeys) {
        if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
            let colsToGroupBy: string[] = [];

            let rowGroupCol = rowGroupCols[groupKeys.length];
            colsToGroupBy.push(rowGroupCol.field);

            return ' group by ' + colsToGroupBy.join(', ');
        } else {
            // select all columns
            return '';
        }
    }

    public createOrderBySql(sortModel) {
        let sortParts: string[] = [];
        if (sortModel) {
            sortModel.forEach(function (item) {
                sortParts.push(item.colId + ' ' + item.sort);
            });
        }
        if (sortParts.length > 0) {
            return ' order by ' + sortParts.join(', ');
        } else {
            return '';
        }
    }

    public isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level. we are at the lowest level
        // if we are grouping by more columns than we have keys for (that means the user
        // has not expanded a lowest level group, OR we are not grouping at all).
        return rowGroupCols.length > groupKeys.length;
    }

    public createLimitSql(startRow, pageSize) {
        return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
    }

    public getRowCount(startRow, pageSize, results) {
        // if no results (maybe an error, or user is seeking for a block well past
        // the possible blocks), then return null, which means we don't know what the
        // last row is. the user should never ask for a block that is past the last block,
        // but they could, for example, purge the cache, and since loading last time rows
        // have been removed from the server.
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }

        // see how many rows we got back
        let rowCount = results.length;

        // if we got back more than the page size, then that means there are more rows
        // after this page, so we return null, as we can't work out the row count
        if (rowCount > pageSize) {
            return null;
        } else {
            // otherwise we have reached the end of the list, ie the last row is in
            // this block, so we can work out the exact row count
            let totalRowCount = startRow + rowCount;
            return totalRowCount;
        }
    }

    public cutResultsToPageSize(pageSize, results) {
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        } else {
            return results;
        }
    }

    public createSqlQuery(tableName: string, request: QueryRequest): string {

        let rowGroupCols = request.rowGroupCols;
        let groupKeys = request.groupKeys;
        let valueCols = request.valueCols;
        let filterModel = request.filterModel;
        let sortModel = request.sortModel;

        let startRow = request.startRow;
        let endRow = request.endRow;
        let pageSize = endRow - startRow;

        let selectSql = this.createSelectSql(request);
        let groupBySql = this.createGroupBySql(rowGroupCols, groupKeys);
        let whereSql = this.createWhereSql(rowGroupCols, groupKeys, filterModel);
        let orderBySql = this.createOrderBySql(sortModel);
        let limitSql = this.createLimitSql(startRow, pageSize);

        let sql = selectSql + ' ' + tableName + '_cols ' + whereSql + groupBySql + orderBySql + limitSql;
        return sql;
    }
}
