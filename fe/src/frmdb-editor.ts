import { onDoc, onEvent } from './delegated-events';
import { queryFormulaEditor } from './formula-editor/formula-editor.component';
import { queryDataGrid, DataGridComponent } from './data-grid/data-grid.component';
import './highlight-box/highlight-box.component';
import './dom-tree/dom-tree.component';
import './frmdb-editor/frmdb-editor.component';
import { BACKEND_SERVICE } from './backend.service';
import { EntityProperty, Entity, Pn } from '@domain/metadata/entity';
import './directives/data-frmdb-select';
import { ServerEventDeleteProperty, ServerEventSetProperty, ServerEventDeleteEntity, ServerEventNewEntity, ServerEventPreviewFormula, ServerEventPutPageHtml, ServerEventNewPage, ServerEventDeletePage } from '@domain/event';
import { UserDeleteColumn, FrmdbSelectChange } from './frmdb-user-events';
import { elvis } from '@core/elvis';
import { updateDOM } from './live-dom-template/live-dom-template';
import { App } from '@domain/app';
import { _resetAppAndTenant } from './app.service';
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from './i18n-fe';
import { entityNameFromDataObjId } from '@domain/metadata/data_obj';
import { DATA_FRMDB_ATTRS_Enum } from './live-dom-template/dom-node';
import { getParentObjId } from './form.service';
import { normalizeHTMLStr, normalizeDOM2HTML } from '@core/normalize-html';
import './fe-functions';
import './form/form.component';
import { FrmdbAppState } from './frmdb-app-state';
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from '@domain/constants';

class FrmdbEditorState extends FrmdbAppState {
    selectedTableId: string;
}

let EditorState: FrmdbEditorState = new FrmdbEditorState('n-a-tenant', 'n-a-app');

window.onpopstate = () => {
    _resetAppAndTenant();
    initEditor(window.location.hash.replace(/^#/, ''));
}

window.addEventListener('DOMContentLoaded', (event) => {
    initEditor(window.location.hash.replace(/^#/, ''));
});

async function initEditor(pagePath: string) {

    $("#vvveb-builder").addClass("no-right-panel");
    $(".component-properties-tab").show();

    let appBackend = BACKEND_SERVICE();
    EditorState = new FrmdbEditorState(appBackend.tenantName, appBackend.appName);
    window['$FRMDB'] = EditorState;

    let app: App | null = await appBackend.getApp();
    if (!app) throw new Error(`App not found for ${window.location}`);
    EditorState.pages = app.pages.map(p => ({ name: p, url: `#/${appBackend.tenantName}/${appBackend.appName}/${p}` }));

    EditorState.selectedPagePath = pagePath;
    EditorState.selectedPageName = pagePath.replace(/.*\//, '');

    ($.fn as any).tooltip.Constructor.Default.whiteList.a = ['data-id', 'href'];

    let iframe = document.querySelector('iframe#iframe-page') as HTMLIFrameElement;
    iframe.src = pagePath;
    iframe.onload = () => {
        initI18n();
        loadTables();
    }
}

function initI18n() {
    const currentLanguage = I18N_FE.getLangDesc(localStorage.getItem('editor-lang') || I18N_FE.defaultLanguage)!;
    if (currentLanguage.lang != I18N_FE.defaultLanguage) {
        setTimeout(() =>
            I18N_FE.translateAll((window as any).FrameDocument, I18N_FE.defaultLanguage, currentLanguage.lang)
        );
    }
}

function changeSelectedTableIdIfDifferent(tableName: string) {
    if (tableName === EditorState.selectedTableId) return;
    EditorState.selectedTableId = tableName;
    updateDOM({ $frmdb: { selectedTableId: EditorState.selectedTableId } }, document.body);
}

function tableManagementFlows() {

    onEvent(document.body, 'click', '[data-frmdb-value="$frmdb.tables[]._id"]', (event: MouseEvent) => {
        changeSelectedTableIdIfDifferent((event.target as any).innerHTML);
    });

    onEvent(document.body, 'click', '#new-table-btn, #new-table-btn *', (event) => {
        var $newTableModal = $('#new-table-modal');
        $newTableModal.find('.alert').hide();
        $("input[name=tableName]", $newTableModal).val('');

        $newTableModal.modal("show").find("form").off("submit").submit(function (event) {

            var name = $("input[name=tableName]", $newTableModal).val();
            if (typeof name !== 'string') { console.warn("Invalid table name", name); return }
            event.preventDefault();

            BACKEND_SERVICE().putEvent(new ServerEventNewEntity(name))
                .then(async (ev: ServerEventNewEntity) => {
                    if (ev.state_ != 'ABORT') {
                        await loadTables(ev.path);
                        $newTableModal.find('.alert').hide();
                        $newTableModal.modal("hide");
                    } else {
                        $newTableModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                    }
                    return ev;
                })

        });
    });

    onEvent(document.body, 'click', '#new-page-btn, #new-page-btn *', (event) => {

        var $newPageModal = $('#new-page-modal');

        $newPageModal.modal("show").find("form").off("submit").submit(function (event) {

            var title = $("input[name=title]", $newPageModal).val() as string;
            var startTemplateUrl = ($("select[name=startTemplateUrl]", $newPageModal).val() as string)
                .replace(/^#/, '');

            //replace nonalphanumeric with dashes and lowercase for name
            var name = title.replace(/\W+/g, '-').replace(/[^_A-Za-z0-9]+/g, '_').toLowerCase() + '.html';

            event.preventDefault();
            BACKEND_SERVICE().putEvent(new ServerEventNewPage(name, startTemplateUrl))
                .then(async (ev: ServerEventNewPage) => {
                    if (ev.state_ != 'ABORT' || ev.error_) {
                        window.location.hash = `${EditorState.tenantName}/${EditorState.appName}/${ev.newPageName}`;
                        $newPageModal.find('.alert').hide();
                        $newPageModal.modal("hide");
                    } else {
                        $newPageModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));

                    }
                });
        });
    });

    onEvent(document.body, 'click', '#save-btn, #save-btn *', (event) => {
        let pagePath = window.location.hash.replace(/^#/, '');
        let html = getHtml();

        return BACKEND_SERVICE().putEvent(new ServerEventPutPageHtml(pagePath, html))
            .then(async (ev: ServerEventPutPageHtml) => {
                if (ev.state_ != 'ABORT') {
                } else {
                    alert(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                }
            })
    });

    onDoc('click', '#delete-table-btn *', (event) => {
        let link: HTMLAnchorElement = event.target.closest('a');
        event.preventDefault();
        let tableName: string | undefined = (link as any).tableToDelete;
        if (!tableName) return;

        if (confirm(`Please confirm deletion of table ${link.dataset.id} ?`)) {

            BACKEND_SERVICE().putEvent(new ServerEventDeleteEntity(tableName))
                .then(async (ev: ServerEventDeleteEntity) => {
                    if (ev.state_ != 'ABORT') {
                        await loadTables(ev.entityId);
                    }
                    return ev;
                });
        }
    });

    onDoc('click', '#delete-page-btn *', (event) => {
        let link: HTMLAnchorElement = event.target.closest('a');
        event.preventDefault();
        let pagePathToDelete: string | undefined = (link as any).pagePathToDelete;
        if (!pagePathToDelete) return;

        if (confirm(`Please confirm deletion of page ${pagePathToDelete} ?`)) {

            BACKEND_SERVICE().putEvent(new ServerEventDeletePage(pagePathToDelete))
                .then(async (ev: ServerEventDeletePage) => {
                    if (ev.state_ != 'ABORT') {
                        window.location.hash = `${EditorState.tenantName}/${EditorState.appName}/index.html`;
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
        if (formulaEditor.frmdbState.formulaHighlightedColumns) {
            dataGrid.highlightColumns = formulaEditor.frmdbState.formulaHighlightedColumns;
        }
    });

    onEvent(document.body, 'FrmdbAddColumn', '*', (event) => {
        let currentEntity: Entity | undefined = EditorState.tables.find(e => e._id == EditorState.selectedTableId);
        if (!currentEntity) { console.warn(`Entity ${EditorState.selectedTableId} does not exist`); return; }
        let entity: Entity = currentEntity;

        var $newColumnModal = $('#new-column-modal');
        $newColumnModal.find('.alert').hide();
        $newColumnModal.find('[data-frmdb-value="selectedTableName"]').text(currentEntity._id);
        $("input[name=columnName]", $newColumnModal).val('');

        $newColumnModal.modal("show").find("form").off("submit").submit(function (event) {

            var name = $("input[name=columnName]", $newColumnModal).val() as string;
            event.preventDefault();

            BACKEND_SERVICE().putEvent(new ServerEventSetProperty(entity, {
                propType_: Pn.STRING,
                name,
            }))
                .then(async (ev: ServerEventSetProperty) => {
                    if (ev.state_ != 'ABORT') {
                        let dataGrid = queryDataGrid(document.body);
                        await dataGrid.initAgGrid();
                        await loadTables(EditorState.selectedTableId);
                        $newColumnModal.find('.alert').hide();
                        $newColumnModal.modal("hide");

                    } else {
                        $newColumnModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                    }
                })
        });
    });

    onEvent(document.body, 'UserDeleteColumn', '*', (event: { detail: UserDeleteColumn }) => {
        let currentEntity: Entity | undefined = EditorState.tables.find(e => e._id == EditorState.selectedTableId);
        if (!currentEntity) { console.warn(`Entity ${EditorState.selectedTableId} does not exist`); return; }
        let entity: Entity = currentEntity;

        if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
            if (entity._id != event.detail.tableName) { console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return; }
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
        updateDOM({ $frmdb: EditorState }, document.body);
    })
        .catch(err => console.error(err));
}

function getCellFromEl(el: HTMLElement): { recordId: string, columnId: string } | null {
    for (let i = 0; i < (el.attributes || []).length; i++) {
        let attrib = el.attributes[i];
        if (attrib.name === 'data-frmdb-table') {
            let tableName = attrib.value.replace(/^\$FRMDB\./, '').replace(/\[\]$/, '');
            return { recordId: el.getAttribute('data-frmdb-record') || `${tableName}~~xyz`, columnId: '_id' };
        } else if (attrib.value && Object.values(DATA_FRMDB_ATTRS_Enum).includes(attrib.name as any)) {
            let recordId = getParentObjId(el);
            if (!recordId) return null;
            let tableName = entityNameFromDataObjId(recordId);
            let columnId = attrib.value.replace(/.*:/, '').replace(`${tableName}[].`, '');
            return { recordId, columnId };
        }
    }

    if (isElementWithTextContent(el)) {
        let recordId = `$Dictionary~~${getTranslationKey(el)}`;
        let columnId = document.querySelector('#frmdb-editor-i18n-select')!.getAttribute('data-i18n') || 'n/a';
        if (columnId == DEFAULT_LANGUAGE) columnId = '_id';
        return { recordId, columnId };
    }

    return null;
}

export function highlightDataGridCell(el: HTMLElement) {
    let dataGrid = queryDataGrid(document);
    let cell = getCellFromEl(el);
    if (!cell) return;
    let { recordId, columnId } = cell;
    let tableName = entityNameFromDataObjId(recordId);
    dataGrid.highlightColumns = {
        [tableName]: {
            [columnId]: CURRENT_COLUMN_HIGHLIGHT_STYLE,
        },
        '$HIGHLIGHT-RECORD$': {
            [recordId]: CURRENT_COLUMN_HIGHLIGHT_STYLE
        }
    };
    changeSelectedTableIdIfDifferent(tableName);
    dataGrid.forceCellRefresh(tableName);
}

function getHtml() {
    /** @type {Document} */
    var doc = this.iframe.contentWindow!.document;
    var hasDoctpe = (doc.doctype !== null);
    var html = "";

    if (hasDoctpe) html =
        "<!DOCTYPE "
        //@ts-ignore
        + doc.doctype.name
        //@ts-ignore
        + (doc.doctype.publicId ? ' PUBLIC "' + doc.doctype.publicId + '"' : '')
        //@ts-ignore
        + (!doc.doctype.publicId && doc.doctype.systemId ? ' SYSTEM' : '')
        //@ts-ignore
        + (doc.doctype.systemId ? ' "' + doc.doctype.systemId + '"' : '')
        + ">\n";

    let cleanedUpDOM: HTMLElement = doc.documentElement.cloneNode(true) as HTMLElement;
    for (let frmdbFragment of Array.from(cleanedUpDOM.querySelectorAll('frmdb-fragment'))) {
        // frmdbFragment.innerHTML = '';//For SEO better to keep this content
    }

    //cleanup stelar.js styles
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('[data-stellar-vertical-offset]'))) {
        (el as HTMLElement).style.removeProperty('transform');
    }

    //cleanup isotope.js styles
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('[data-category]'))) {
        (el as HTMLElement).style.removeProperty('position');
        (el as HTMLElement).style.removeProperty('left');
        (el as HTMLElement).style.removeProperty('top');
        (el as HTMLElement).style.removeProperty('display');
    }
    for (let isotopeGrid of Array.from(cleanedUpDOM.querySelectorAll('.frmdb-isotope-grid.grid'))) {
        (isotopeGrid as HTMLElement).style.removeProperty('position');
        (isotopeGrid as HTMLElement).style.removeProperty('height');
    }

    //cleanup responsive nav dropdown
    {
        let el = document.querySelector('.frmdb-responsive-nav-more-items-dropdown');
        while (el && el.firstChild) el.removeChild(el.firstChild);
    }

    //cleanup tracking code
    for (let jsEl of Array.from(cleanedUpDOM.querySelectorAll('head > script[src="https://www.google-analytics.com/analytics.js"]'))) {
        if (jsEl.parentElement) {
            jsEl.parentElement.removeChild(jsEl);
        }
    }
    for (let jsEl of Array.from(cleanedUpDOM.querySelectorAll('head > script[src*="hotjar.com"]'))) {
        if (jsEl.parentElement) {
            jsEl.parentElement.removeChild(jsEl);
        }
    }
    for (let stEl of Array.from(cleanedUpDOM.getElementsByTagName('style'))) {
        if ((stEl.textContent||'').indexOf('iframe#_hjRemoteVarsFrame') >= 0) {
            stEl.parentElement!.removeChild(stEl);
        }
    }
    for (let el of Array.from(cleanedUpDOM.querySelectorAll('.frmdb-editor-on'))) {
        el.classList.remove('frmdb-editor-on');
    }

    html += normalizeDOM2HTML(cleanedUpDOM) + "\n</html>";

    html = html.replace(/<.*?data-vvveb-helpers.*?>/gi, "");
    html = html.replace(/\s*data-vvveb-\w+(=["'].*?["'])?\s*/gi, "");
    html = html.replace(/\s*<!-- Code injected by live-server(.|\n)+<\/body>/, '</body>');

    return html;
}

tableManagementFlows();
tableColumnManagementFlows();
