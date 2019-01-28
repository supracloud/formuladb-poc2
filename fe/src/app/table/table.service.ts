import { Injectable } from '@angular/core';
import { BackendService } from '../backend.service';
import { IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { SumReduceFunN } from '@core/domain/metadata/reduce_functions';
import { SimpleAddHocQuery } from '@core/key_value_store_i';
import { Entity } from '../entity-state';

@Injectable()
export class TableService {

  constructor(private backendService: BackendService) { }

  public getDataSource(entity: Entity): IServerSideDatasource {
    let self = this;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        let req = params.request;

        self.backendService.simpleAdHocQuery(entity._id, {
          whereFilters: [],
          groupColumns: [],
          groupAggs: [],
          groupFilters: [],
          columns: self.selectColumns(entity, req),
          sortColumns: [],
          limit: req.endRow - req.startRow + 1,
          offset: req.startRow
        })
          .then((data: any[]) => params.successCallback(data, data.length))
          .catch(() => params.failCallback());
      }
    };
  }

  isDoingGrouping(req: IServerSideGetRowsRequest) {
    // we are not doing grouping if at the lowest level. we are at the lowest level
    // if we are grouping by more columns than we have keys for (that means the user
    // has not expanded a lowest level group, OR we are not grouping at all).
    return req.rowGroupCols.length > req.groupKeys.length;
  };

  selectColumns(entity: Entity, req: IServerSideGetRowsRequest): string[] {
    let { rowGroupCols, valueCols, groupKeys } = req;
    if (this.isDoingGrouping(req)) {
      let colsToSelect: string[] = [];

      let rowGroupCol = rowGroupCols[groupKeys.length];
      colsToSelect.push(rowGroupCol.field);

      valueCols.forEach(function (valueCol) {
        colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
      });

      return colsToSelect;
    } else {
      return Object.keys(entity.props);
    }
  }

  groupColumns(req: IServerSideGetRowsRequest): string[] {
    let { rowGroupCols, groupKeys } = req;
    if (this.isDoingGrouping(req)) {
      let colsToGroupBy: string[] = [];

      let rowGroupCol = rowGroupCols[groupKeys.length];
      colsToGroupBy.push(rowGroupCol.field);
      return colsToGroupBy;

    } else return [];
  }

  createFilterSql(key, item) {
    switch (item.filterType) {
      case 'text': return this.createTextFilterSql(key, item);
      case 'number': return this.createNumberFilterSql(key, item);
      default: console.log('unkonwn filter type: ' + item.filterType);
    }
  }

  createNumberFilterSql(key, item) {
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

  createTextFilterSql(key, item) {
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

  whereFilters(rowGroupCols, groupKeys, filterModel): {colName: string, op: string, value: string | number | boolean}[] {
    var that = this;
    var whereFilters: {colName: string, op: string, value: string | number | boolean}[] = [];

    if (groupKeys.length > 0) {
      groupKeys.forEach(function (key, index) {
        var colName = rowGroupCols[index].field;
        whereFilters.push({colName, op: '=', value: key});
      });
    }

    if (filterModel) {
      var keySet = Object.keys(filterModel);
      keySet.forEach(function (key) {
        var item = filterModel[key];
        // whereFilters.push(that.createFilterSql(key, item));
      });
    }

    return whereFilters;

  }
}
