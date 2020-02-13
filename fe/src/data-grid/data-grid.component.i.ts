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
    debouncedForceCellRefresh();
    initAgGrid();
    forceReloadData();
}

export function queryDataGrid(el: Document | HTMLElement): DataGridComponentI {
    let dataGrid: DataGridComponentI = el.querySelector("frmdb-data-grid") as DataGridComponentI;
    if (!dataGrid) throw new Error("data-grid not found");
    return dataGrid;
}
