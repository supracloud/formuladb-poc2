import {
    Grid, GridOptions,
    GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellFocusedEvent, ColDef, VanillaFrameworkOverrides, RefreshCellsParams, GetMainMenuItemsParams, MenuItemDef
} from 'ag-grid-community';import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";
import { setAgGridLicense } from '@fe/licenses';

const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/dom-tree/dom-tree.component.scss').default;
const HTML: string = /*html*/`
    <style>${CSS}</style>
    <div id="zaGrid" style="height: 100%;" class="ag-theme-balham"></div>
`;

interface NodeData {
    filePath: string[];
}
class FileCellRenderer { 
    eGui: HTMLElement;

    init (params) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = this.getFileIcon(params.value);
        tempDiv.innerHTML = icon ? '<i class="' + icon + '"/>' + '<span class="filename">' + value + '</span>' : value;
        this.eGui = tempDiv.firstChild as HTMLElement;
    }

    getGui () {
        return this.eGui;
    }
    
    getFileIcon(filename) {
        return filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'fa fa-file-audio-o'
            : filename.endsWith('.xls') ? 'fa fa-file-excel-o'
                : filename.endsWith('.txt') ? 'fa fa fa-file-o'
                    : filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' : 'fa fa-folder';
    }
}


export class DomTreeComponent extends HTMLElement {
    rootEl: HTMLElement | undefined;
    static observedAttributes = ['root-element'];

    constructor() {
        super();
        setAgGridLicense();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = HTML;
    }

    connectedCallback() {
        this.style.display = "block";

        new Grid(this.shadowRoot!.querySelector("#zaGrid") as HTMLElement, this.gridOptions);
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.rootEl = document.querySelector(newVal);
        this.init();
    }

    init() {
        if (!this.rootEl) return;
    }

    // specify the columns
    columnDefs = [
        {
            field: 'dateModified',
            cellClassRules: {
                'hover-over': (params) => { return params.node === this.potentialParent; }
            }
        },
        {
            field: 'size',
            valueFormatter: (params) => {
                return params.value ? params.value + ' MB' : '';
            },
            cellClassRules: {
                'hover-over': (params) => { return params.node === this.potentialParent; }
            }
        }
    ];

    // specify the data
    rowData = [
        { id: 1, filePath: ['Documents'], type: 'folder' },
        { id: 2, filePath: ['Documents', 'txt'], type: 'folder' },
        { id: 3, filePath: ['Documents', 'txt', 'notes.txt'], type: 'file', dateModified: 'May 21 2017 01:50:00 PM', size: 14.7 },
        { id: 4, filePath: ['Documents', 'pdf'], type: 'folder' },
        { id: 5, filePath: ['Documents', 'pdf', 'book.pdf'], type: 'file', dateModified: 'May 20 2017 01:50:00 PM', size: 2.1 },
        { id: 6, filePath: ['Documents', 'pdf', 'cv.pdf'], type: 'file', dateModified: 'May 20 2016 11:50:00 PM', size: 2.4 },
        { id: 7, filePath: ['Documents', 'xls'], type: 'folder' },
        { id: 8, filePath: ['Documents', 'xls', 'accounts.xls'], type: 'file', dateModified: 'Aug 12 2016 10:50:00 AM', size: 4.3 },
        { id: 9, filePath: ['Documents', 'stuff'], type: 'folder' },
        { id: 10, filePath: ['Documents', 'stuff', 'xyz.txt'], type: 'file', dateModified: 'Jan 17 2016 08:03:00 PM', size: 1.1 },
        { id: 11, filePath: ['Music'], type: 'folder' },
        { id: 12, filePath: ['Music', 'mp3'], type: 'folder' },
        { id: 13, filePath: ['Music', 'mp3', 'theme.mp3'], type: 'file', dateModified: 'Sep 11 2016 08:03:00 PM', size: 14.3 },
        { id: 14, filePath: ['Misc'], type: 'folder' },
        { id: 15, filePath: ['Misc', 'temp.txt'], type: 'file', dateModified: 'Aug 12 2016 10:50:00 PM', size: 101 }
    ];

    gridOptions: GridOptions = {
        defaultColDef: {
            resizable: true
        },
        components: {
            fileCellRenderer: FileCellRenderer
        },
        columnDefs: this.columnDefs,
        rowData: this.rowData,
        treeData: true,
        animateRows: true,
        groupDefaultExpanded: -1,
        getDataPath: (data) => {
            return data.filePath;
        },
        getRowNodeId: (data) => {
            return data.id;
        },
        autoGroupColumnDef: {
            rowDrag: true,
            headerName: 'Files',
            width: 250,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: 'fileCellRenderer'
            },
            cellClassRules: {
                'hover-over': (params) => { return params.node === this.potentialParent; }
            }
        },
        onRowDragEnd: (ev) => this.onRowDragEnd(ev),
        onRowDragMove: (ev) => this.onRowDragMove(ev),
        onRowDragLeave: (ev) => this.onRowDragLeave(ev),
    };

    potentialParent: {data: NodeData} | undefined = undefined;

    onRowDragMove(event) {
        this.setPotentialParentForNode(event.api, event.overNode);
    }

    onRowDragLeave(event) {
        // clear node to highlight
        this.setPotentialParentForNode(event.api, null);
    }

    onRowDragEnd(event) {
        if (!this.potentialParent) { return; }

        var movingData = event.node.data;

        // take new parent path from parent, if data is missing, means it's the root node,
        // which has no data.
        var newParentPath = this.potentialParent.data ? this.potentialParent.data.filePath : [];
        var needToChangeParent = !this.arePathsEqual(newParentPath, movingData.filePath);

        // check we are not moving a folder into a child folder
        var invalidMode = this.isSelectionParentOfTarget(event.node, this.potentialParent);
        if (invalidMode) {
            console.log('invalid move');
        }

        if (needToChangeParent && !invalidMode && this.gridOptions && this.gridOptions.api) {

            var updatedRows = [];
            this.moveToPath(newParentPath, event.node, updatedRows);

            this.gridOptions.api.updateRowData({
                update: updatedRows
            });
            this.gridOptions.api.clearFocusedCell();
        }

        // clear node to highlight
        this.setPotentialParentForNode(event.api, null);
    }

    moveToPath(newParentPath, node, allUpdatedNodes) {
        // last part of the file path is the file name
        var oldPath = node.data.filePath;
        var fileName = oldPath[oldPath.length - 1];
        var newChildPath = newParentPath.slice();
        newChildPath.push(fileName);

        node.data.filePath = newChildPath;

        allUpdatedNodes.push(node.data);

        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach((childNode) => {
                this.moveToPath(newChildPath, childNode, allUpdatedNodes);
            });
        }
    }

    isSelectionParentOfTarget(selectedNode, targetNode) {
        var children = selectedNode.childrenAfterGroup;
        for (var i = 0; i < children.length; i++) {
            if (targetNode && children[i].key === targetNode.key) return true;
            this.isSelectionParentOfTarget(children[i], targetNode);
        }
        return false;
    }

    arePathsEqual(path1, path2) {
        if (path1.length !== path2.length) { return false; }

        var equal = true;
        path1.forEach((item, index) => {
            if (path2[index] !== item) {
                equal = false;
            }
        });

        return equal;
    }

    setPotentialParentForNode(api, overNode) {

        var newPotentialParent;
        if (overNode) {
            newPotentialParent = overNode.data.type === 'folder'
                // if over a folder, we take the immediate row
                ? overNode
                // if over a file, we take the parent row (which will be a folder)
                : overNode.parent;
        } else {
            newPotentialParent = null;
        }

        var alreadySelected = this.potentialParent === newPotentialParent;
        if (alreadySelected) { return; }

        // we refresh the previous selection (if it exists) to clear
        // the highlighted and then the new selection.
        var rowsToRefresh: any[] = [];
        if (this.potentialParent) {
            rowsToRefresh.push(this.potentialParent);
        }
        if (newPotentialParent) {
            rowsToRefresh.push(newPotentialParent);
        }

        this.potentialParent = newPotentialParent;

        this.refreshRows(api, rowsToRefresh);
    }

    refreshRows(api, rowsToRefresh) {
        var params = {
            // refresh these rows only.
            rowNodes: rowsToRefresh,
            // because the grid does change detection, the refresh
            // will not happen because the underlying value has not
            // changed. to get around this, we force the refresh,
            // which skips change detection.
            force: true
        };
        api.refreshCells(params);
    }
}

customElements.define('frmdb-dom-tree', DomTreeComponent);
