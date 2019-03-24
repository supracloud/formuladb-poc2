import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { SimpleAddHocQuery } from '@core/key_value_store_i';
import { Entity } from '@core/domain/metadata/entity';
import { FrmdbStreamsService } from '../state/frmdb-streams.service';
import { waitUntilNotNull } from '@core/ts-utils';

@Injectable()
export class TableService {
  currentEntity: Entity;
  constructor(private backendService: BackendService, private frmdbStreams: FrmdbStreamsService) {
    frmdbStreams.entity$.subscribe(e => this.currentEntity = e);
  }

  public getDataSource(): IServerSideDatasource {
    return {
      getRows: async (params: IServerSideGetRowsParams): Promise<void> => {
        await waitUntilNotNull(() => Promise.resolve(this.currentEntity));
        let req = params.request;
        this.backendService.simpleAdHocQuery(this.currentEntity._id, req as SimpleAddHocQuery)
          .then((data: any[]) => {
            console.log("%c <---- simpleAdHocQuery: ",
              "color: green; font-size: 115%; font-weight: bold; text-decoration: underline;", data);
            return params.successCallback(data, 
              this.getRowCount(req.startRow, req.endRow - req.startRow, data.length))
          })
          .catch((err) => {
            console.warn(err);
            params.failCallback();
          });
      }
    };
  }

  private getRowCount(startRow: number, pageSize: number, resultsLength: number) {
    // if no results (maybe an error, or user is seeking for a block well past
    // the possible blocks), then return null, which means we don't know what the
    // last row is. the user should never ask for a block that is past the last block,
    // but they could, for example, purge the cache, and since loading last time rows
    // have been removed from the server.
    if (resultsLength === 0) {
        return -1;
    }

    // see how many rows we got back
    let rowCount = resultsLength;

    // if we got back more than the page size, then that means there are more rows
    // after this page, so we return null, as we can't work out the row count
    if (rowCount > pageSize) {
        return -1;
    } else {
        // otherwise we have reached the end of the list, ie the last row is in
        // this block, so we can work out the exact row count
        let totalRowCount = startRow + rowCount;
        return totalRowCount;
    }
}
  
}
