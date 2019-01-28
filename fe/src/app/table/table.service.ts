import { Injectable } from '@angular/core';
import { BackendService } from '../backend.service';
import { IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { SumReduceFunN } from '@core/domain/metadata/reduce_functions';
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
    let {rowGroupCols, valueCols, groupKeys} = req;
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
}
