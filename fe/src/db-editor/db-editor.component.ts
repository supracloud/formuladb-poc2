/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


import * as _ from 'lodash';
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { VNavComponent, queryVNav } from '@fe/v-nav/v-nav.component';
import { DataGridComponent, queryDataGrid } from '@fe/data-grid/data-grid.component';
import { onEvent } from '@fe/delegated-events';
import { ServerEventNewEntityN, ServerEventNewEntity } from '@domain/event';
import { BACKEND_SERVICE } from '@fe/backend.service';

const HTML: string = require('raw-loader!@fe-assets/db-editor/db-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/db-editor/db-editor.component.scss').default;
interface DbEditorAttrs {

};

export interface DbEditorState extends DbEditorAttrs {
}

declare var Vvveb: any;

@FrmdbElementDecorator<DbEditorAttrs, DbEditorState>({
    tag: 'frmdb-db-editor',
    observedAttributes: [],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class DbEditorComponent extends FrmdbElementBase<DbEditorAttrs, DbEditorState> {
    connectedCallback() {
        onEvent(this, 'frmdbchange', 'frmdb-v-nav', (event) => {
            this.setActiveTable();
        });
        onEvent(this, 'click', '#new-table-btn *', (event) => {
            Vvveb.Gui.newTable(newTableName => 
                BACKEND_SERVICE().putEvent(new ServerEventNewEntity(newTableName))
                .then(async (ev: ServerEventNewEntity) => {
                    if (ev.state_ != 'ABORT') {
                        let nav = queryVNav(this);
                        await nav.loadTables(ev.path);    
                    }
                    return ev;
                })
                .then(ev => ev.state_ == 'ABORT' ? ev.notifMsg_ || ev.error_ : null)
            )
        });
    }
    
    setActiveTable() {
        let nav = queryVNav(this);
        let dataGrid = queryDataGrid(this);

        dataGrid.setAttributeTyped("table_name", nav.frmdbState.selectedEntityId || '');
    }
}
