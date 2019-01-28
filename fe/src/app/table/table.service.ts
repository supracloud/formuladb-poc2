import { Injectable } from '@angular/core';
import { BackendService } from '../backend.service';
import { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';

@Injectable()
export class TableService {

  constructor(private backendService: BackendService) { }

  public getDataSource(entity: string): IServerSideDatasource {
    let backendService = this.backendService;
    return {
      getRows(params: IServerSideGetRowsParams): void {
        backendService.getTableData(entity)
          .then((data: any[]) => params.successCallback(data, data.length))
          .catch(() => params.failCallback());
      }
    };
  }
}
