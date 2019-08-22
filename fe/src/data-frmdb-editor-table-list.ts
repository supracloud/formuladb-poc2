/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/


import * as _ from 'lodash';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { Entity } from '@domain/metadata/entity';
import { onEvent } from '@fe/delegated-events';
import { elvis_el } from '@fe/live-dom-template/dom-node';
import { elvis } from "@core/elvis";
import { FrmdbSelectChange } from './frmdb-user-events';
import { updateDOM } from './live-dom-template/live-dom-template';
import { FrmdbSelect } from './data-frmdb-select';

declare var Vvveb: any;

export class FrmdbEditorTableList extends FrmdbSelect {

    public tables: Entity[] = [];
    public selectedTableId: string;

    constructor(elem: HTMLElement) {
        super(elem);
    }

    loadTables(selectedTable?: string) {

        return BACKEND_SERVICE().getEntities().then(entities => {
            this.selectedTableId = selectedTable || entities[0]._id;
            setTimeout(() => elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = entities[0]._id, 500);

            this.tables = entities;
        });
    }

}

export function queryFrmdbEditorTableList(): HTMLElement & {frmdbEditorTableList: FrmdbEditorTableList} {
    let el: HTMLElement | null = document.querySelector("[data-frmdb-editor-table-list]");
    if (!el) throw new Error("data-frmdb-editor-table-list not found");
    (el as any).frmdbEditorTableList = new FrmdbEditorTableList(el);
    return el as any;
}
