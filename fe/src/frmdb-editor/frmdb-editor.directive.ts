import * as _ from "lodash";
import { onEvent, onDoc, getTarget } from "@fe/delegated-events";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { Entity, EntityProperty, Pn } from "@domain/metadata/entity";
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from "@fe/i18n-fe";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { ServerEventNewEntity, ServerEventNewPage, ServerEventPutPageHtml, ServerEventDeleteEntity, ServerEventDeletePage, ServerEventSetProperty, ServerEventDeleteProperty } from "@domain/event";
import { queryDataGrid, DataGridComponentI } from "@fe/data-grid/data-grid.component.i";
import { queryFormulaEditor, FormulaEditorComponent } from "@fe/formula-editor/formula-editor.component";
import { UserDeleteColumn, FrmdbSelectPageElement } from "@fe/frmdb-user-events";
import { elvis } from "@core/elvis";
import { DATA_FRMDB_ATTRS_Enum } from "@fe/live-dom-template/dom-node";
import { getParentObjId } from "@fe/form.service";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from "@domain/constants";
import { normalizeDOM2HTML } from "@core/normalize-html";
import { FrmdbFeComponentI, queryFrmdbFe } from "@fe/fe.i";
import { App } from "@domain/app";
import "@fe/highlight-box/highlight-box.component";
import "@fe/dom-tree/dom-tree.component";
import "@fe/component-editor/element-editor.component";
import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";
import { launchFullScreen } from "@fe/frmdb-editor-gui";
import { ElementEditorComponent } from "@fe/component-editor/element-editor.component";
import { $SAVE_DOC_PAGE } from "@fe/fe-functions";

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

export class FrmdbEditorDirective {
    static observedAttributes = ['root-element'];
    backendService = BACKEND_SERVICE();
    EditorState: FrmdbEditorState;
    frmdbFe: FrmdbFeComponentI;
    iframe: HTMLIFrameElement;
    canvas: HTMLDivElement;
    dataGrid: DataGridComponentI;
    letPanel: HTMLElement;
    highlightBox: HighlightBoxComponent;
    elementEditor: ElementEditorComponent;

    get frameDoc(): Document {
        return this.iframe.contentWindow!.document;
    }

    constructor() {
        this.EditorState = new FrmdbEditorState(this.backendService.tenantName, this.backendService.appName);

        this.iframe = document.body.querySelector('iframe')!;
        this.canvas = document.body.querySelector('#canvas') as HTMLDivElement;
        this.elementEditor = document.body.querySelector('frmdb-element-editor') as ElementEditorComponent;
        this.frmdbFe = queryFrmdbFe();

        window.addEventListener('load', () => {
            this.dataGrid = queryDataGrid(document.body);
            this.letPanel = document.body.querySelector('.left-panel') as HTMLElement;
            this.highlightBox = document.body.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
    
            this.tableManagementFlows();
            this.tableColumnManagementFlows();
            this.initI18n();
            this.loadTables();
            this.loadPages();
            this.viewManagementFlows();
            this.iframe.src = window.location.hash.replace(/^#/, '');
            this.iframe.onload = () => {
                this.highlightBox.rootEl = this.iframe.contentWindow!.document;
            }
            this.pageElementFlows();
        })
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
        updateDOM({ $frmdb: { selectedTableId: this.EditorState.selectedTableId } }, document.body);
    }

    tableManagementFlows() {

        onEvent(document.body, 'click', '[data-frmdb-value="$frmdb.tables[]._id"]', (event: MouseEvent) => {
            this.changeSelectedTableIdIfDifferent(getTarget(event)!.innerHTML);
        });

        onEvent(document.body, 'click', '#new-table-btn, #new-table-btn *', (event) => {
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

        onEvent(document.body, 'click', '#new-page-btn, #new-page-btn *', (event) => {

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
        
        onEvent(document.body, 'click', '#save-btn, #save-btn *', (event) => {
            let pagePath = window.location.hash.replace(/^#/, '');
            $SAVE_DOC_PAGE(pagePath, this.frameDoc);
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
            this.dataGrid.forceReloadData();
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

        onEvent(document.body, 'FrmdbAddColumn', '*', (event) => {
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
                            let dataGrid = queryDataGrid(document.body);
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

        onEvent(document.body, 'UserDeleteColumn', '*', (event: { detail: UserDeleteColumn }) => {
            let currentEntity: Entity | undefined = this.EditorState.tables.find(e => e._id == this.EditorState.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.EditorState.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
                if (entity._id != event.detail.tableName) { console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return; }
                BACKEND_SERVICE().putEvent(new ServerEventDeleteProperty(entity, event.detail.columnName))
                    .then(async (ev: ServerEventDeleteProperty) => {
                        if (ev.state_ != 'ABORT') {
                            let dataGrid = queryDataGrid(document.body);
                            await dataGrid.initAgGrid();
                            await this.loadTables(this.EditorState.selectedTableId);
                        }
                        return ev;
                    });
            }

        });
    }

    viewManagementFlows() {

        onEvent(document.body, 'click', '#fullscreen-btn, #fullscreen-btn *', (event) => {
            launchFullScreen(document);
        });

        let preview = false;
        onEvent(document.body, 'click', '#preview-btn, #preview-btn *', (event) => {
            preview = !preview;
            if (preview) {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "32px");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "0px");
                this.dataGrid.style.display = 'none';
                this.letPanel.style.display = 'none';
            } else {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "30vh");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "15vw");
                this.dataGrid.style.display = 'block';                        
                this.letPanel.style.display = 'block';
            }
        });

        onEvent(document.body, 'click', '[data-frmdb-action^="viewport-"], [data-frmdb-action^="viewport-"] *', (event: MouseEvent) => {
            let target = getTarget(event)!.closest('[data-frmdb-action]')!;
            let viewport = target.getAttribute('data-frmdb-action');
            if (viewport === "viewport-laptop") {
                this.canvas.style.width = 'calc(100vw - var(--frmdb-editor-left-panel-width))';
                this.canvas.style.marginLeft = '0px';
            } else if (viewport === "viewport-tablet") {
                this.canvas.style.width = '768px';
                this.canvas.style.marginLeft = 'calc((100vw - 768px - var(--frmdb-editor-left-panel-width)) / 2)';
            } else if (viewport === "viewport-mobile") {
                this.canvas.style.width = '320px';
                this.canvas.style.marginLeft = 'calc((100vw - 320px - var(--frmdb-editor-left-panel-width)) / 2)';
            }
        });
    }

    pageElementFlows() {

        onEvent(this.highlightBox, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            let node = event.detail.el;
            this.highlightDataGridCell(node);
            this.elementEditor.editedEl = node;
        });
    }

    async loadTables(selectedTable?: string) {
        return BACKEND_SERVICE().getEntities().then(entities => {

            this.EditorState.tables = entities;
            this.EditorState.selectedTableId = selectedTable || entities[0]._id;
            setTimeout(() => elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = entities[0]._id, 500);
            updateDOM({ $frmdb: this.EditorState }, document.body);
        })
            .catch(err => console.error(err));
    }

    async loadPages() {
        let app: App | null = await this.backendService.getApp();
        if (!app) throw new Error(`App not found for ${window.location}`);
        this.EditorState.pages = app.pages.map(p => ({ name: p, url: `#/${this.backendService.tenantName}/${this.backendService.appName}/${p}` }));
        let pagePath = window.location.hash.replace(/^#/, '');
        this.EditorState.selectedPagePath = pagePath;
        this.EditorState.selectedPageName = pagePath.replace(/.*\//, '') || 'index.html';
        updateDOM({ $frmdb: this.EditorState }, document.body);
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

}

new FrmdbEditorDirective();
