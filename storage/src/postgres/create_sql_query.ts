import { SimpleAddHocQueryFilterItem, AggFunc } from "@domain/metadata/simple-add-hoc-query";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";

export class CreateSqlQuery {

    private getCast(aggFunc: AggFunc): string {
        switch (aggFunc) {
            case "sum":
                return '::int';
            case "count":
                return '::int';
            default: return '';
        }
        
    }
    public createSelectSql(req: SimpleAddHocQuery) {
        let rowGroupCols = {};
        let valueCols: any[] = [];
        let groupKeys = [];
        if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
            let colsToSelect: string[] = [];

            let rowGroupCol = rowGroupCols[groupKeys.length];
            colsToSelect.push(rowGroupCol.field);

            valueCols.forEach((valueCol) => {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ')' + this.getCast(valueCol.aggFunc) + ' as ' + valueCol.field);
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
            default: throw new Error('unknown filter type: ' + item.filterType);
        }
    }

    public createNumberFilterSql(key, item: SimpleAddHocQueryFilterItem) {
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
                return key + " = '" + item.filter + "'";
            case 'notEqual':
                return key + " != '" + item.filter + "'";
            case 'contains':
                return key + " ILIKE '%" + item.filter + "%'";
            case 'notContains':
                return key + " NOT ILIKE '%" + item.filter + "%'";
            case 'startsWith':
                return key + " ILIKE '" + item.filter + "%'";
            case 'endsWith':
                return key + " ILIKE '%" + item.filter + "'";
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
                whereParts.push(colName + " = '" + key + "'")
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

    public createGroupBySql(rowGroupCols: {field: string}[], groupKeys: string[]) {
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
            return ' order by 1 desc';
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

    public cutResultsToPageSize(pageSize, results) {
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        } else {
            return results;
        }
    }

    public createSqlQuery(tableName: string, request: SimpleAddHocQuery): string {

        let rowGroupCols: any = {};
        let valueCols: any[] = [];
        let groupKeys = [];
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

        let sql = selectSql + ' FROM ' + tableName + ' ' + whereSql + groupBySql + orderBySql + limitSql;
        return sql;
    }
}
