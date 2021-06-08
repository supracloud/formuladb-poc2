import { DataObj } from "@domain/metadata/data_obj";
import { SimpleAddHocQueryFilterItem } from "@domain/metadata/simple-add-hoc-query";

export interface DataGridComponentI extends HTMLElement {
    highlightColumns: { 
        [tableName: string]: { 
            [columnName: string]: string | {
                'background-image': string,
                'background-size': string,
            }
        } 
    };
    tableName?: string;
    selectedColumnName?: string;
    selectedRow: DataObj;
    debouncedForceCellRefresh();
    initAgGrid();
    forceReloadData();
    getFilterModel(): {
        [x: string]: SimpleAddHocQueryFilterItem;
    }
}

export function queryDataGrid(el: Document | HTMLElement): DataGridComponentI {
    let dataGrid: DataGridComponentI = el.querySelector("frmdb-data-grid") as DataGridComponentI;
    if (!dataGrid) throw new Error("data-grid not found");
    return dataGrid;
}
