
import { IServerSideDatasource, IServerSideGetRowsParams, IDatasource, IGetRowsParams } from '@ag-grid-community/core';
import * as _ from "lodash";

import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { PickOmit } from '@domain/ts-utils';
import { BACKEND_SERVICE } from './backend.service';
import { Pn, EntityProperty } from '@domain/metadata/entity';
import { ColumnTypes } from '@domain/metadata/types';
import { DataObj } from '@domain/metadata/data_obj';
import { getDATA_BINDING_MONITOR } from './init';


export interface ColumnFilter {
    operator: string;
    value: string;
}
export interface TableColumn {
    _id: string;
    width?: number;
    sort?: string;
    filter?: ColumnFilter;
    skipExportExcel?: boolean;
    name: string;
    entityProperty: EntityProperty;
}

export class TableService {

    public getDatasource(entityId: string): IDatasource {
        return {
            getRows: async (params: IGetRowsParams): Promise<void> =>
                this.getTableRows(entityId, params)
        }
    }

    public async getColumns(entityId: string): Promise<TableColumn[]> {
        let entity = await BACKEND_SERVICE().getEntity(entityId);
        if (!entity) throw new Error("Entity " + entityId + " not found!");
        return _.values(entity.props).filter(pn => !['_owner', '_role', '_rev'].includes(pn.name)).map(pn => ({
            _id: entityId + "." + pn.name,
            name: pn.name,
            entityProperty: pn
        } as TableColumn));
    }

    public async getTableRows(entityId: string, params: IGetRowsParams) {
        let req = params;
        let dataBindingMonitor = await getDATA_BINDING_MONITOR();
        dataBindingMonitor.queryTableRecords(entityId, {
            ...req,
            rowGroupCols: [],
            valueCols: [],
            pivotCols: [],
            pivotMode: false,
            groupKeys: [],
        } as SimpleAddHocQuery)
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


    private getRowCount(startRow: number, pageSize: number, resultsLength: number) {
        // if no results (maybe an error, or user is seeking for a block well past
        // the possible blocks), then return null, which means we don't know what the
        // last row is. the user should never ask for a block that is past the last block,
        // but they could, for example, purge the cache, and since loading last time rows
        // have been removed from the server.
        if (resultsLength === 0) {
            // return -1;
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

export const TABLE_SERVICE = new TableService();
