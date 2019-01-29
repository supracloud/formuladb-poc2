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
        self.backendService.simpleAdHocQuery(entity._id, params.request as SimpleAddHocQuery)
          .then((data: any[]) => params.successCallback(data, data.length))
          .catch(() => params.failCallback());
      }
    };
  }
}
