import {
    Grid, GridOptions, GridApi, GridReadyEvent,
} from 'ag-grid-community';import * as _ from "lodash";
import { setAgGridLicense } from '@fe/licenses';

const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/dom-tree/dom-tree.component.scss').default;
const HTML: string = /*html*/`
    <style>${CSS}</style>
    <div id="zaGrid" style="height: 100%;" class="ag-theme-balham"></div>
`;

interface NodeData {
    domPath: string;
    el: Element;
}
class FileCellRenderer { 
    eGui: HTMLElement;

    init (params) {
        var tempDiv = document.createElement('div');
        var value = params.value;
        var icon = this.getElementIcon(params.value);
        tempDiv.innerHTML = icon ? '<i class="' + icon + '"/>' + '<span class="filename">' + value + '</span>' : value;
        this.eGui = tempDiv.firstChild as HTMLElement;
    }

    getGui () {
        return this.eGui;
    }
    
    getElementIcon(filename) {
        return filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'frmdb-i-fa-file-audio-o'
            : filename.endsWith('.xls') ? 'frmdb-i-fa-file-excel-o'
                : filename.endsWith('.txt') ? 'fa frmdb-i-fa-file-o'
                    : filename.endsWith('.pdf') ? 'frmdb-i-fa-file-pdf-o' : 'frmdb-i-fa-folder';
    }
}


export class DomTreeComponent extends HTMLElement {
    _rootEl: HTMLElement | undefined;
    grid: Grid | undefined;
    private gridApi: GridApi;

    get rootEl(): HTMLElement | undefined {
        return this._rootEl;
    }
    set rootEl(el: HTMLElement | undefined) {
        this._rootEl = el;
        this.init();
    }

    constructor() {
        super();
        setAgGridLicense();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = HTML;
    }

    connectedCallback() {
        this.style.display = "block";

        if (!this.grid) {
            this.grid = new Grid(this.shadowRoot!.querySelector("#zaGrid") as HTMLElement, this.gridOptions);
        }
    }

    init() {
        if (!this.rootEl || !this.gridApi) return;
        let rootNodeData = {
            domPath: '',
            el: this.rootEl,
        };
        let rowData: NodeData[] = [];
        this.loadNodes(rootNodeData, rowData);
        this.gridApi.setRowData(rowData);
    }

    loadNodes(parent: NodeData, gridData: NodeData[]) {
        for (var i = 0; i < parent.el.children.length; i++) {
            let childEl = parent.el.children[i];
            if (!childEl.tagName) continue;
            let nodeData = {
                domPath: (parent.domPath ? parent.domPath + '/' : '' ) + `${childEl.tagName.toLowerCase()}.${i+1}`,
                el: childEl,
            }; 
            gridData.push(nodeData);
            this.loadNodes(nodeData, gridData);
        }
    }

    // specify the columns
    columnDefs = [
    ];

    gridOptions: GridOptions = {
        defaultColDef: {
            resizable: true
        },
        components: {
            fileCellRenderer: FileCellRenderer
        },
        headerHeight: 0,
        suppressHorizontalScroll: true,
        columnDefs: this.columnDefs,
        rowData: [],
        treeData: true,
        animateRows: true,
        groupDefaultExpanded: -1,
        getDataPath: (data: NodeData) => {
            return data.domPath.split('/');
        },
        getRowNodeId: (data: NodeData) => {
            return data.domPath;
        },
        autoGroupColumnDef: {
            rowDrag: true,
            headerName: 'Components & Layers',
            width: 250,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: 'fileCellRenderer'
            },
            cellClassRules: {
                'hover-over': (params) => { return params.node === this.potentialParent; }
            }
        },
        // onRowDragEnd: (ev) => this.onRowDragEnd(ev),
        // onRowDragMove: (ev) => this.onRowDragMove(ev),
        // onRowDragLeave: (ev) => this.onRowDragLeave(ev),
        onGridReady: (params: GridReadyEvent) => {
            if (!this.gridApi) {
                this.gridApi = params.api as GridApi;
            }
            console.debug("onGridReady", this.gridApi);
        },
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
        var newParentPath = this.potentialParent.data ? this.potentialParent.data.domPath : [];
        var needToChangeParent = !this.arePathsEqual(newParentPath, movingData.domPath);

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
        var oldPath = node.data.domPath;
        var fileName = oldPath[oldPath.length - 1];
        var newChildPath = newParentPath.slice();
        newChildPath.push(fileName);

        node.data.domPath = newChildPath;

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
