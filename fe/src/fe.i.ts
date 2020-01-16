export interface FrmdbFeComponentI extends HTMLElement {
    loadExternalStyleSheet(styleUrl: string): Promise<any>;
}

export function queryFrmdbFe(el: Document | HTMLElement = document): FrmdbFeComponentI {
    let frmdbFe: FrmdbFeComponentI = el.querySelector("frmdb-fe") as FrmdbFeComponentI;
    if (!frmdbFe) throw new Error("frmdb-fe not found");
    return frmdbFe;
}
