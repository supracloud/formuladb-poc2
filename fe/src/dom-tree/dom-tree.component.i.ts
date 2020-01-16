export interface DomtreeComponentI extends HTMLElement {
}

export function queryDomTree(el: Document | HTMLElement): DomtreeComponentI {
    let dataGrid: DomtreeComponentI = el.querySelector("frmdb-dom-tree") as DomtreeComponentI;
    if (!dataGrid) throw new Error("dom-tree not found");
    return dataGrid;
}
