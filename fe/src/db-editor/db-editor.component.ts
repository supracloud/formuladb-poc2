/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


import * as _ from 'lodash';
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { VNavComponent, queryVNav } from '@fe/v-nav/v-nav.component';
import { DataGridComponent, queryDataGrid } from '@fe/data-grid/data-grid.component';
import { onEvent, onDoc } from '@fe/delegated-events';
import { ServerEventNewEntityN, ServerEventNewEntity, ServerEventDeleteEntity, ServerEventSetProperty, ServerEventDeleteProperty } from '@domain/event';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { Entity, Pn } from '@domain/metadata/entity';
import { UserDeleteColumn } from '@fe/frmdb-user-events';

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

        onDoc('click', '.popover .delete-table-btn *', (event) => {
            let link: HTMLAnchorElement = event.target.closest('a');
            event.preventDefault();
            if (!link.dataset.id) return;

            if (confirm(`Please confirm deletion of table ${link.dataset.id} ?`)) {
        
                BACKEND_SERVICE().putEvent(new ServerEventDeleteEntity(link.dataset.id))
                .then(async (ev: ServerEventNewEntity) => {
                    if (ev.state_ != 'ABORT') {
                        let nav = queryVNav(this);
                        await nav.loadTables(ev.path);    
                    }
                    return ev;
                });
            }
        });
        
        onEvent(this, 'click', '.add-column-to-table-btn,.add-column-to-table-btn *', (event) => {
            let nav = queryVNav(this);
            let currentEntity: Entity | undefined = nav.entities.find(e => e._id == nav.frmdbState.selectedEntityId);
            if (!currentEntity) {console.warn(`Entity ${nav.frmdbState.selectedEntityId} does not exist`); return;}
            let entity: Entity = currentEntity;

            Vvveb.Gui.newColumn(entity._id, newColumnName => {
                return BACKEND_SERVICE().putEvent(new ServerEventSetProperty(entity, {
                    propType_: Pn.STRING,
                    name: newColumnName,
                }))
                .then(async (ev: ServerEventSetProperty) => {
                    if (ev.state_ != 'ABORT') {
                        let dataGrid = queryDataGrid(this);
                        await dataGrid.initAgGrid();
                        let nav = queryVNav(this);
                        await nav.loadTables(nav.frmdbState.selectedEntityId);                            
                    }
                    return ev;
                })
                .then(ev => ev.state_ == 'ABORT' ? ev.notifMsg_ || ev.error_ : null)
            })
        });
        
        onEvent(this, 'UserDeleteColumn', '*', (event: {detail: UserDeleteColumn}) => {
            let nav = queryVNav(this);
            let currentEntity: Entity | undefined = nav.entities.find(e => e._id == nav.frmdbState.selectedEntityId);
            if (!currentEntity) {console.warn(`Entity ${nav.frmdbState.selectedEntityId} does not exist`); return;}
            let entity: Entity = currentEntity;

            if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
                if (entity._id != event.detail.tableName) {console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return;}
                BACKEND_SERVICE().putEvent(new ServerEventDeleteProperty(entity, event.detail.columnName))
                .then(async (ev: ServerEventDeleteProperty) => {
                    if (ev.state_ != 'ABORT') {
                        let dataGrid = queryDataGrid(this);
                        await dataGrid.initAgGrid();    
                        let nav = queryVNav(this);
                        await nav.loadTables(nav.frmdbState.selectedEntityId);                            
                    }
                    return ev;
                });
            }

        });
    }
    
    setActiveTable() {
        let nav = queryVNav(this);
        let dataGrid = queryDataGrid(this);

        dataGrid.setAttributeTyped("table_name", nav.frmdbState.selectedEntityId || '');
    }
}
