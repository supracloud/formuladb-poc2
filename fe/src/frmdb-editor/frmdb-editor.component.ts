import * as _ from "lodash";
import { onEvent, onDoc, getTarget } from "@fe/delegated-events";
import './table-list.component';
import './page-list.component';
import { BACKEND_SERVICE } from "@fe/backend.service";
import { Entity, EntityProperty, Pn } from "@domain/metadata/entity";
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from "@fe/i18n-fe";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { ServerEventNewEntity, ServerEventNewPage, ServerEventPutPageHtml, ServerEventDeleteEntity, ServerEventDeletePage, ServerEventSetProperty, ServerEventDeleteProperty } from "@domain/event";
import { queryDataGrid, DataGridComponentI } from "@fe/data-grid/data-grid.component.i";
import { queryFormulaEditor, FormulaEditorComponent } from "@fe/formula-editor/formula-editor.component";
import { UserDeleteColumn } from "@fe/frmdb-user-events";
import { elvis } from "@core/elvis";
import { DATA_FRMDB_ATTRS_Enum } from "@fe/live-dom-template/dom-node";
import { getParentObjId } from "@fe/form.service";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from "@domain/constants";
import { normalizeDOM2HTML } from "@core/normalize-html";
import { FrmdbFeComponentI, queryFrmdbFe } from "@fe/fe.i";

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
    frmdbFe: FrmdbFeComponentI;

    constructor() {
        super();

        this.EditorState = new FrmdbEditorState(this.backendService.tenantName, this.backendService.appName);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;

        this.frmdbFe = queryFrmdbFe();
        this.frmdbFe.loadExternalStyleSheet('/formuladb-static/icons/line-awesome/css/line-awesome.min.css');
        this.frmdbFe.loadExternalStyleSheet('/formuladb/css/ad-grid-balham-font.css');
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
            this.changeSelectedTableIdIfDifferent(getTarget(event)!.innerHTML);
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
            let link: HTMLAnchorElement = getTarget(event)!.closest('a')!;
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
            let link: HTMLAnchorElement = getTarget(event)!.closest('a')!;
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
            let formulaEditor: FormulaEditorComponent = queryFormulaEditor(document);
            let dataGrid: DataGridComponentI = getTarget(event) as DataGridComponentI;

            let entity: Entity = BACKEND_SERVICE().currentSchema.entities[dataGrid.tableName || ''];
            let prop: EntityProperty | undefined = entity.props[dataGrid.selectedColumnName || ''];
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
        dataGrid.forceCellRefresh();
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
