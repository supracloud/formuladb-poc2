import { onDoc, onEvent } from './delegated-events';
import { queryFormulaEditor } from './formula-editor/formula-editor.component';
import { queryDataGrid, DataGridComponent, CURRENT_COLUMN_HIGHLIGHT_STYLE } from './data-grid/data-grid.component';
import { BACKEND_SERVICE } from './backend.service';
import { EntityProperty, Entity, Pn } from '@domain/metadata/entity';
import './directives/data-frmdb-select';
import { ServerEventDeleteProperty, ServerEventSetProperty, ServerEventDeleteEntity, ServerEventNewEntity } from '@domain/event';
import { UserDeleteColumn, FrmdbSelectChange } from './frmdb-user-events';
import { elvis } from '@core/elvis';
import { updateDOM } from './live-dom-template/live-dom-template';
import { App } from '@domain/app';
import { _resetAppAndTenant } from './app.service';
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from './i18n-fe';
import { entityNameFromDataObjId } from '@domain/metadata/data_obj';
import { DATA_FRMDB_ATTRS_Enum } from './live-dom-template/dom-node';
import { getParentObjId } from './form.service';

declare var Vvveb: any;

interface FrmdbEditorState {
    tables: Entity[];
    selectedTableId: string;
    pages: {name: string, url: string }[];
    selectedPageName: string;
}

const EditorState: FrmdbEditorState = {
    tables: [],
    selectedTableId: '',
    pages: [],
    selectedPageName: '',
}

window.onpopstate = () => {
    _resetAppAndTenant();
    initEditor();
}

window.addEventListener('DOMContentLoaded', (event) => {
    initEditor();
});

async function initEditor() {

    let appBackend = BACKEND_SERVICE();
    Vvveb.Gui.FRMDB_BACKEND_SERVICE = appBackend;

    let app: App | null = await appBackend.getApp();
    if (!app) throw new Error(`App not found for ${window.location}`);
    EditorState.pages = app.pages.map(p => ({name: p, url: `#/${appBackend.tenantName}/${appBackend.appName}/${p}`}));
    let indexUrl;
    let vvvebPages: any[] = [];
    for (let page of app.pages) {
        let url = `/${appBackend.tenantName}/${appBackend.appName}/${page}.html`;
        if (page === "index") indexUrl = url;
        vvvebPages.push({ name: page, title: page, url });
    }

    //overwrite loadPage
    indexUrl = indexUrl || vvvebPages.length > 0 ? vvvebPages[0].name : "index-page-not-found";
    Vvveb.FileManager.loadPage = function (name, allowedComponents = false, disableCache = true) {
        window.location.href = window.location.href.replace(/p=.*/, `p=${name}`);
    }

    let pageName = window.location.hash.replace(new RegExp(`/?${appBackend.tenantName}/${appBackend.appName}/?`), '')
        .replace(/^#/, '').replace(/\.html$/, '');
    EditorState.selectedPageName = pageName;
    let url = (vvvebPages.find(p => p.name == pageName) || { url: indexUrl }).url;
    Vvveb.Builder.init(url, function () {
        Vvveb.FileManager.loadComponents();

        const currentLanguage = I18N_FE.getLangDesc(localStorage.getItem('editor-lang') || I18N_FE.defaultLanguage)!;
        if (currentLanguage.lang != I18N_FE.defaultLanguage) {
            setTimeout(() => 
                I18N_FE.translateAll((window as any).FrameDocument, I18N_FE.defaultLanguage, currentLanguage.lang)
            );
        }        
    });

    Vvveb.Gui.init();
    Vvveb.FileManager.init();
    Vvveb.FileManager.addPages(vvvebPages);

    ($.fn as any).tooltip.Constructor.Default.whiteList.a = ['data-id', 'href'];

    loadTables();
}

function changeSelectedTableIdIfDifferent(tableName: string) {
    if (tableName === EditorState.selectedTableId) return;
    EditorState.selectedTableId = tableName;
    updateDOM({$frmdb: {selectedTableId: EditorState.selectedTableId}}, document.body);
}

function tableManagementFlows() {

    onEvent(document.body, 'click', '[data-frmdb-value="$frmdb.tables[]._id"]', (event: MouseEvent) => {
        changeSelectedTableIdIfDifferent((event.target as any).innerHTML);
    });

    onEvent(document.body, 'click', '#new-table-btn *', (event) => {
        Vvveb.Gui.newTable(newTableName => 
            BACKEND_SERVICE().putEvent(new ServerEventNewEntity(newTableName))
            .then(async (ev: ServerEventNewEntity) => {
                if (ev.state_ != 'ABORT') {
                    await loadTables(ev.path);    
                }
                return ev;
            })
            .then(ev => ev.state_ == 'ABORT' ? ev.notifMsg_ || ev.error_ : null)
        )
    });
    
    onDoc('click', '#delete-table-btn *', (event) => {
        let link: HTMLAnchorElement = event.target.closest('a');
        event.preventDefault();
        if (!link.dataset.id) return;
    
        if (confirm(`Please confirm deletion of table ${link.dataset.id} ?`)) {
    
            BACKEND_SERVICE().putEvent(new ServerEventDeleteEntity(link.dataset.id))
            .then(async (ev: ServerEventDeleteEntity) => {
                if (ev.state_ != 'ABORT') {
                    await loadTables(ev.entityId);
                }
                return ev;
            });
        }
    });

    
    onDoc('FrmdbColumnChanged', '*', (event) => {
        let dataGrid = queryDataGrid(document);
        dataGrid.forceReloadData();
    });
    
}

function tableColumnManagementFlows() {

    onDoc("frmdbchange", "frmdb-data-grid", async (event) => {
        let formulaEditor = queryFormulaEditor(document);
        let dataGrid = event.target as DataGridComponent;

        let entity: Entity = BACKEND_SERVICE().currentSchema.entities[dataGrid.getAttributeTyped("table_name") || ''];
        let prop: EntityProperty | undefined = entity.props[dataGrid.frmdbState.selectedColumnName || ''];
        formulaEditor.frmdbState.editedEntity = entity;
        formulaEditor.frmdbState.editedProperty = prop;
    });

    onDoc("frmdbchange", "frmdb-formula-editor", async (event) => {
        let formulaEditor = queryFormulaEditor(document);
        let dataGrid = queryDataGrid(document);
        dataGrid.frmdbState.highlightColumns = formulaEditor.frmdbState.formulaHighlightedColumns;
    });

    onEvent(document.body, 'FrmdbAddColumn', '*', (event) => {
        let currentEntity: Entity | undefined = EditorState.tables.find(e => e._id == EditorState.selectedTableId);
        if (!currentEntity) {console.warn(`Entity ${EditorState.selectedTableId} does not exist`); return;}
        let entity: Entity = currentEntity;

        Vvveb.Gui.newColumn(entity._id, newColumnName => {
            return BACKEND_SERVICE().putEvent(new ServerEventSetProperty(entity, {
                propType_: Pn.STRING,
                name: newColumnName,
            }))
            .then(async (ev: ServerEventSetProperty) => {
                if (ev.state_ != 'ABORT') {
                    let dataGrid = queryDataGrid(document.body);
                    await dataGrid.initAgGrid();
                    await loadTables(EditorState.selectedTableId);                            
                }
                return ev;
            })
            .then(ev => ev.state_ == 'ABORT' ? ev.notifMsg_ || ev.error_ : null)
        })
    });

    onEvent(document.body, 'UserDeleteColumn', '*', (event: {detail: UserDeleteColumn}) => {
        let currentEntity: Entity | undefined = EditorState.tables.find(e => e._id == EditorState.selectedTableId);
        if (!currentEntity) {console.warn(`Entity ${EditorState.selectedTableId} does not exist`); return;}
        let entity: Entity = currentEntity;

        if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
            if (entity._id != event.detail.tableName) {console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return;}
            BACKEND_SERVICE().putEvent(new ServerEventDeleteProperty(entity, event.detail.columnName))
            .then(async (ev: ServerEventDeleteProperty) => {
                if (ev.state_ != 'ABORT') {
                    let dataGrid = queryDataGrid(document.body);
                    await dataGrid.initAgGrid();    
                    await loadTables(EditorState.selectedTableId);                            
                }
                return ev;
            });
        }

    });
}

async function loadTables(selectedTable?: string) {
    return BACKEND_SERVICE().getEntities().then(entities => {

        EditorState.tables = entities;
        EditorState.selectedTableId = selectedTable || entities[0]._id;
        setTimeout(() => elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = entities[0]._id, 500);
        updateDOM({$frmdb: EditorState}, document.body);
    })
    .catch(err => console.error(err));
}

function getCellFromEl(el: HTMLElement): {recordId: string, columnId: string} | null {
    for (let i = 0; i < el.attributes.length; i++) {
        let attrib = el.attributes[i];
        console.warn(DATA_FRMDB_ATTRS_Enum);
        if (attrib.value && Object.values(DATA_FRMDB_ATTRS_Enum).includes(attrib.name)) {
            let recordId = getParentObjId(el);
            let tableName = entityNameFromDataObjId(recordId);
            let columnId = attrib.value.replace(/.*:/, '').replace(`${tableName}[].`, '');
            return {recordId, columnId};
        }
    }

    if (isElementWithTextContent(el)) {
        let recordId = `$Dictionary~~${getTranslationKey(el)}`;
        let columnId = document.querySelector('#frmdb-editor-i18n-select')!.getAttribute('data-i18n') || 'n/a';
        if (columnId == DEFAULT_LANGUAGE) columnId = '_id';
        return {recordId, columnId};
    }

    return null;
}

function frmdbEditorHighlightDataGridCell(el: HTMLElement) {
    let dataGrid = queryDataGrid(document);
    let cell = getCellFromEl(el);
    if (!cell) return;
    let {recordId, columnId} = cell;
    let tableName = entityNameFromDataObjId(recordId);
    dataGrid.frmdbState.highlightColumns = {
        [tableName]: {
            [columnId]: CURRENT_COLUMN_HIGHLIGHT_STYLE,
        }
    };
    changeSelectedTableIdIfDifferent(tableName);
    dataGrid.forceCellRefresh();
}
(window as any).frmdbEditorHighlightDataGridCell = frmdbEditorHighlightDataGridCell;

tableManagementFlows();
tableColumnManagementFlows();
