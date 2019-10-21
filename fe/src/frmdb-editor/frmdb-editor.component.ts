import * as _ from "lodash";
import { onEvent, onDoc } from "@fe/delegated-events";
import './table-list.component';
import './page-list.component';
import { BACKEND_SERVICE } from "@fe/backend.service";
import { loadFont } from "@fe/fonts/fonts";
import { Entity, EntityProperty, Pn } from "@domain/metadata/entity";
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from "@fe/i18n-fe";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { ServerEventNewEntity, ServerEventNewPage, ServerEventPutPageHtml, ServerEventDeleteEntity, ServerEventDeletePage, ServerEventSetProperty, ServerEventDeleteProperty } from "@domain/event";
import { queryDataGrid, DataGridComponent } from "@fe/data-grid/data-grid.component";
import { queryFormulaEditor } from "@fe/formula-editor/formula-editor.component";
import { UserDeleteColumn } from "@fe/frmdb-user-events";
import { elvis } from "@core/elvis";
import { DATA_FRMDB_ATTRS_Enum } from "@fe/live-dom-template/dom-node";
import { getParentObjId } from "@fe/form.service";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from "@domain/constants";
import { normalizeDOM2HTML } from "@core/normalize-html";

class FrmdbEditorState {
    tables: Entity[] = [];
    pages: { name: string, url: string }[];
    selectedPageName: string;
    selectedPagePath: string;
    selectedTableId: string;

    constructor(public tenantName: string, public appName: string) {
        this.pages = [{ name: 'index.html', url: `${tenantName}/${appName}/index.html` }];
        this.selectedPageName = this.pages[0].name;
        this.selectedPagePath = this.pages[0].url;
    }
}

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/frmdb-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/frmdb-editor.component.scss').default;

export class FrmdbEditorComponent extends HTMLElement {
    static observedAttributes = ['root-element'];
    backendService = BACKEND_SERVICE();
    EditorState: FrmdbEditorState;

    constructor() {
        super();

        this.EditorState = new FrmdbEditorState(this.backendService.tenantName, this.backendService.appName);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;

        loadExternalStyles('/formuladb-static/icons/line-awesome/css/line-awesome.min.css');
        loadAgGridFont();
    }

    connectedCallback() {
        document.body.style.setProperty('--frmdb-editor-top-panel-height', "30vh");
        document.body.style.setProperty('--frmdb-editor-left-panel-width', "15vw");
        
        this.tableManagementFlows();
        this.tableColumnManagementFlows();
        this.initI18n();
        this.loadTables();
    }
    disconnectedCallback() {
        document.body.style.setProperty('--frmdb-editor-top-panel-height', "0px");
        document.body.style.setProperty('--frmdb-editor-left-panel-width', "0px");
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.init();
    }

    init() {

    }

    showIntroVideoModal() {
        let $introVideoModal = $('#intro-video-modal');
        $introVideoModal.find('video').attr('src', `/formuladb-static/${BACKEND_SERVICE().appName}/intro.webm`);
        $introVideoModal.modal("show").on('hidden.bs.modal', (e) => {
            ($introVideoModal.find('video')[0] as HTMLVideoElement).pause();
        });
    }

    initI18n() {
        const currentLanguage = I18N_FE.getLangDesc(localStorage.getItem('editor-lang') || I18N_FE.defaultLanguage)!;
        if (currentLanguage.lang != I18N_FE.defaultLanguage) {
            setTimeout(() =>
                I18N_FE.translateAll((window as any).FrameDocument, I18N_FE.defaultLanguage, currentLanguage.lang)
            );
        }
    }

    changeSelectedTableIdIfDifferent(tableName: string) {
        if (tableName === this.EditorState.selectedTableId) return;
        this.EditorState.selectedTableId = tableName;
        updateDOM({ $frmdb: { selectedTableId: this.EditorState.selectedTableId } }, this.shadowRoot as any as HTMLElement);
    }

    tableManagementFlows() {

        onEvent(this, 'click', '[data-frmdb-value="$frmdb.tables[]._id"]', (event: MouseEvent) => {
            this.changeSelectedTableIdIfDifferent((event.target as any).innerHTML);
        });

        onEvent(this, 'click', '#new-table-btn, #new-table-btn *', (event) => {
            var $newTableModal = $('#new-table-modal');
            $newTableModal.find('.alert').hide();
            $("input[name=tableName]", $newTableModal).val('');

            $newTableModal.modal("show").find("form").off("submit").submit((event) => {

                var name = $("input[name=tableName]", $newTableModal).val();
                if (typeof name !== 'string') { console.warn("Invalid table name", name); return }
                event.preventDefault();

                BACKEND_SERVICE().putEvent(new ServerEventNewEntity(name))
                    .then(async (ev: ServerEventNewEntity) => {
                        if (ev.state_ != 'ABORT') {
                            await this.loadTables(ev.path);
                            $newTableModal.find('.alert').hide();
                            $newTableModal.modal("hide");
                        } else {
                            $newTableModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                        }
                        return ev;
                    })

            });
        });

        onEvent(this, 'click', '#new-page-btn, #new-page-btn *', (event) => {

            var $newPageModal = $('#new-page-modal');

            $newPageModal.modal("show").find("form").off("submit").submit((event) => {

                var title = $("input[name=title]", $newPageModal).val() as string;
                var startTemplateUrl = ($("select[name=startTemplateUrl]", $newPageModal).val() as string)
                    .replace(/^#/, '');

                //replace nonalphanumeric with dashes and lowercase for name
                var name = title.replace(/\W+/g, '-').replace(/[^_A-Za-z0-9]+/g, '_').toLowerCase() + '.html';

                event.preventDefault();
                BACKEND_SERVICE().putEvent(new ServerEventNewPage(name, startTemplateUrl))
                    .then(async (ev: ServerEventNewPage) => {
                        if (ev.state_ != 'ABORT' || ev.error_) {
                            window.location.hash = `${this.EditorState.tenantName}/${this.EditorState.appName}/${ev.newPageName}`;
                            $newPageModal.find('.alert').hide();
                            $newPageModal.modal("hide");
                        } else {
                            $newPageModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));

                        }
                    });
            });
        });

        onEvent(this, 'click', '#save-btn, #save-btn *', (event) => {
            let pagePath = window.location.hash.replace(/^#/, '');
            let html = this.getHtml();

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
                            await this.loadTables(ev.entityId);
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
                            window.location.hash = `${this.EditorState.tenantName}/${this.EditorState.appName}/index.html`;
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

    tableColumnManagementFlows() {

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

        onEvent(this, 'FrmdbAddColumn', '*', (event) => {
            let currentEntity: Entity | undefined = this.EditorState.tables.find(e => e._id == this.EditorState.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.EditorState.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            var $newColumnModal = $('#new-column-modal');
            $newColumnModal.find('.alert').hide();
            $newColumnModal.find('[data-frmdb-value="selectedTableName"]').text(currentEntity._id);
            $("input[name=columnName]", $newColumnModal).val('');

            $newColumnModal.modal("show").find("form").off("submit").submit((event) => {

                var name = $("input[name=columnName]", $newColumnModal).val() as string;
                event.preventDefault();

                BACKEND_SERVICE().putEvent(new ServerEventSetProperty(entity, {
                    propType_: Pn.STRING,
                    name,
                }))
                    .then(async (ev: ServerEventSetProperty) => {
                        if (ev.state_ != 'ABORT') {
                            let dataGrid = queryDataGrid(this);
                            await dataGrid.initAgGrid();
                            await this.loadTables(this.EditorState.selectedTableId);
                            $newColumnModal.find('.alert').hide();
                            $newColumnModal.modal("hide");

                        } else {
                            $newColumnModal.find('.alert').show().text(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                        }
                    })
            });
        });

        onEvent(this, 'UserDeleteColumn', '*', (event: { detail: UserDeleteColumn }) => {
            let currentEntity: Entity | undefined = this.EditorState.tables.find(e => e._id == this.EditorState.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.EditorState.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
                if (entity._id != event.detail.tableName) { console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return; }
                BACKEND_SERVICE().putEvent(new ServerEventDeleteProperty(entity, event.detail.columnName))
                    .then(async (ev: ServerEventDeleteProperty) => {
                        if (ev.state_ != 'ABORT') {
                            let dataGrid = queryDataGrid(this);
                            await dataGrid.initAgGrid();
                            await this.loadTables(this.EditorState.selectedTableId);
                        }
                        return ev;
                    });
            }

        });
    }

    async loadTables(selectedTable?: string) {
        return BACKEND_SERVICE().getEntities().then(entities => {

            this.EditorState.tables = entities;
            this.EditorState.selectedTableId = selectedTable || entities[0]._id;
            setTimeout(() => elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = entities[0]._id, 500);
            updateDOM({ $frmdb: this.EditorState }, this.shadowRoot as any as HTMLElement);
        })
            .catch(err => console.error(err));
    }

    getCellFromEl(el: HTMLElement): { recordId: string, columnId: string } | null {
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

    highlightDataGridCell(el: HTMLElement) {
        let dataGrid = queryDataGrid(document);
        let cell = this.getCellFromEl(el);
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
        this.changeSelectedTableIdIfDifferent(tableName);
        dataGrid.forceCellRefresh(tableName);
    }

    getHtml() {
        /** @type {Document} */
        let doc: Document = window.document;
        let hasDoctpe = (doc.doctype !== null);
        let html = "";

        if (hasDoctpe) html = "<!DOCTYPE "
            + doc.doctype!.name
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
            if ((stEl.textContent || '').indexOf('iframe#_hjRemoteVarsFrame') >= 0) {
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

}

customElements.define('frmdb-editor', FrmdbEditorComponent);

var fontStylesheetElement: HTMLLinkElement | null = null;
function loadExternalStyles(styleUrl: string): Promise < any > {
    if(fontStylesheetElement) return Promise.resolve();
    return new Promise((resolve, reject) => {
        fontStylesheetElement = document.createElement('link');
        fontStylesheetElement.rel = 'stylesheet';
        fontStylesheetElement.href = styleUrl;
        fontStylesheetElement.onload = resolve;
        document.head.appendChild(fontStylesheetElement);
    });
}

var agGridFontStyleEl: HTMLStyleElement | null = null;
function loadAgGridFont(): Promise < any > {
    if(agGridFontStyleEl) return Promise.resolve();
    return new Promise((resolve, reject) => {
        agGridFontStyleEl = document.createElement('style');
        let fontTxtNode = document.createTextNode(`
		@font-face {
			font-family: "agGridBalham";
			src: url("data:application/x-font-ttf;charset=utf-8;base64,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") format("truetype");
			font-weight: normal;
			font-style: normal;
        }
        `);
        agGridFontStyleEl.appendChild(fontTxtNode);
        document.head.appendChild(agGridFontStyleEl);
    });
}
