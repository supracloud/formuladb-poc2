import * as _ from "lodash";
import * as events from "@domain/event";
import { onEvent, onDoc, getTarget, onEventChildren } from "@fe/delegated-events";
import { BACKEND_SERVICE, RESET_BACKEND_SERVICE, BackendService } from "@fe/backend.service";
import { Entity, EntityProperty, Pn } from "@domain/metadata/entity";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { ServerEventNewEntity, ServerEventNewPage, ServerEventPutPageHtml, ServerEventDeleteEntity, ServerEventDeletePage, ServerEventSetProperty, ServerEventDeleteProperty, ServerEventPutMediaObject, ServerEventNewApp } from "@domain/event";
import { queryDataGrid, DataGridComponentI } from "@fe/data-grid/data-grid.component.i";
import { queryFormulaEditor, FormulaEditorComponent } from "@fe/formula-editor/formula-editor.component";
import { UserDeleteColumn, FrmdbSelectPageElement, FrmdbSelectPageElementAction, UserSelectedCell } from "@fe/frmdb-user-events";
import { elvis } from "@core/elvis";
import { DATA_FRMDB_ATTRS_Enum } from "@fe/live-dom-template/dom-node";
import { getParentObjId } from "@fe/form.service";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from "@domain/constants";

import { FrmdbFeComponentI, queryFrmdbFe } from "@fe/fe.i";
import '../directives/data-toggle-tab.directive';
import '../directives/data-toggle-modal.directive';

import { App } from "@domain/app";
import { $SAVE_DOC_PAGE } from "@fe/fe-functions";

import "@fe/highlight-box/highlight-box.component";
import { HighlightBoxComponent } from "@fe/highlight-box/highlight-box.component";

import { launchFullScreen } from "@fe/frmdb-editor-gui";

import "@fe/component-editor/component-editor.component";
import { ElementEditorComponent } from "../component-editor/component-editor.component";

// import "./element-tree.component";
// import { ElementTreeComponent } from "./element-tree.component";

import "@fe/theme-customizer/theme-customizer.component";
import { ThemeCustomizerComponent } from "@fe/theme-customizer/theme-customizer.component";

import "@fe/i18n-customizer/i18n-customizer.component";

import "@fe/frmdb-editor/add-element.component";
import { AddElementComponent } from "./add-element.component";

import { pageElementFlows } from "./page-element-flows";

import "@fe/frmdb-editor/img-editor.component";
import { ImgEditorComponent } from "./img-editor.component";

import "@fe/frmdb-editor/icon-editor.component";
import { IconEditorComponent } from "./icon-editor.component";
import { BLOBS } from "./blobs";
import { frmdbSetImageSrc } from "@fe/component-editor/components-frmdb";
import { Undo } from "./undo";
import { $FMODAL } from "../directives/data-toggle-modal.directive";
import { I18N_UTILS, isElementWithTextContent, getTranslationKey } from "@core/i18n-utils";
import { DEFAULT_LANGUAGE, I18nLang } from "@domain/i18n";
import { parsePageUrl, switchEditorOffInPath, PageOpts } from "@domain/url-utils";
import { registerFrmdbEditorRouterHandler } from "./frmdb-editor-router";
import { registerChangesFeedHandler } from "@fe/changes-feed-client";

declare var $: null, jQuery: null;

class FrmdbEditorState {
    apps: { name: string, url: string }[] = [];
    tables: Entity[] = [];
    pages: { name: string, url: string }[];
    selectedAppName: string;
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
    EditorState: FrmdbEditorState;
    frmdbFe: FrmdbFeComponentI;
    iframe: HTMLIFrameElement;
    canvas: HTMLDivElement;
    dataGrid: DataGridComponentI;
    letPanel: HTMLElement;
    highlightBox: HighlightBoxComponent;
    addElementCmp: AddElementComponent;
    imgEditorCmp: ImgEditorComponent;
    iconEditorCmp: IconEditorComponent;
    // elementTree: ElementTreeComponent;
    elementEditor: ElementEditorComponent;
    themeCustomizer: ThemeCustomizerComponent;

    get frameDoc(): Document {
        return this.iframe.contentWindow!.document;
    }

    updateStateFromUrl() {

    }

    init() {
        let tenantName = BACKEND_SERVICE().tenantName;
        let appName = BACKEND_SERVICE().appName;
        this.EditorState = new FrmdbEditorState(tenantName, appName);

        window.addEventListener('load', () => {
            this.iframe = document.body.querySelector('iframe#app')! as HTMLIFrameElement;
            this.canvas = document.body.querySelector('#canvas') as HTMLDivElement;
            this.elementEditor = document.body.querySelector('frmdb-element-editor') as ElementEditorComponent;
            this.frmdbFe = queryFrmdbFe();
            this.dataGrid = queryDataGrid(document.body);
            this.letPanel = document.body.querySelector('.left-panel') as HTMLElement;
            this.highlightBox = document.body.querySelector('frmdb-highlight-box') as HighlightBoxComponent;
            this.addElementCmp = document.body.querySelector('frmdb-add-element') as AddElementComponent;
            this.imgEditorCmp = document.body.querySelector('frmdb-img-editor') as ImgEditorComponent;
            this.iconEditorCmp = document.body.querySelector('frmdb-icon-editor') as IconEditorComponent;
            // this.elementTree = document.body.querySelector('frmdb-element-tree') as ElementTreeComponent;
            this.themeCustomizer = document.body.querySelector('frmdb-theme-customizer') as ThemeCustomizerComponent;

            this.tableManagementFlows();
            this.tableColumnManagementFlows();
            this.loadApps();
            this.loadTables();
            this.loadPages();
            this.viewManagementFlows();
            let ff = () => {
                this.highlightBox.rootEl = this.iframe.contentWindow!.document;
                this.iframe.contentWindow!.document.body.classList.add('frmdb-editor-on', 'frmdb-editor-normal');
                pageElementFlows(this);
                this.hookIframeChangesFeed(this.iframe.contentWindow!);
            }
            this.iframe.onload = ff;

            //FIXME: Ugly Workaround for e2e where onload is not getting called:
            setTimeout(ff, 2000);

            this.iframe.src = switchEditorOffInPath(window.location.pathname);
        });

        registerFrmdbEditorRouterHandler('editor-iframe-src', (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => {
            let { appName: currentAppName } = parsePageUrl(new URL(this.iframe.src).pathname);
            let { appName } = newPageOpts;

            this.iframe.src = switchEditorOffInPath(newPath);

            if (currentAppName != appName) {
                RESET_BACKEND_SERVICE();
                this.loadTables();
                this.loadPages();
                this.updateCurrentApp();
            } else {
                this.updateCurrentPage();
            }
        }, () => this.checkSafeNavigation());
    }

    hookIframeChangesFeed(iframeWindow: Window) {
        registerChangesFeedHandler('editor-iframe-handlers-hook', async (events: events.MwzEvents[]) => {
            let handlers: { [name: string]: (events: events.MwzEvents[]) => Promise<void> } = 
                (iframeWindow as any).$FRMDB_CHANGES_FEED_HANDLERS_IN_IFRAME$;

            await Promise.all(Object.values(handlers).map(h => h(events)));
        });
    }

    showIntroVideoModal() {
        let introVideoModal = $FMODAL('#intro-video-modal');
        introVideoModal.querySelector('video')!.setAttribute('src', `/formuladb-env/static/${BACKEND_SERVICE().appName}/intro.webm`);
        introVideoModal.addEventListener('FrmdbModalCloseEvent', (e) => {
            (introVideoModal.querySelector('video')! as HTMLVideoElement).pause();
        });
    }

    checkSafeNavigation(): boolean {
        let safeToNavigate = false;
        if (Undo.hasChanges()) {
            if (confirm(`There are ${Undo.ngActiveChanges() + 1} changes, are you sure you want leave this page ?`)) {
                safeToNavigate = true;
                Undo.clear();
            }
        } else safeToNavigate = true;

        return safeToNavigate;
    }


    checkSafeNavigationForEvent(event) {
        if (!this.checkSafeNavigation()) event.preventDefault();
    }

    changeSelectedTableIdIfDifferent(tableName: string) {
        if (tableName === this.EditorState.selectedTableId) return;
        this.EditorState.selectedTableId = tableName;
        updateDOM({ $frmdb: { selectedTableId: this.EditorState.selectedTableId } }, document.body);
    }

    selectElement(el: HTMLElement | null) {
        this.highlightBox.selectElement(el);
        if (el) {
            this.highlightDataGridCell(el);
            this.elementEditor.setEditedEl(el);
            // this.elementTree.render(el);
        }
    }

    tableManagementFlows() {

        onEvent(document.body, 'click', '[data-frmdb-value="$frmdb.apps[]"]', (event: MouseEvent) => {
            this.checkSafeNavigationForEvent(event);
        });

        onEvent(document.body, 'click', '[data-frmdb-value="$frmdb.tables[]._id"]', (event: MouseEvent) => {
            this.changeSelectedTableIdIfDifferent(getTarget(event)!.innerHTML);
        });

        onEvent(document.body, 'click', 'a[data-frmdb-value="$frmdb.pages[].name"]', (event: MouseEvent) => {
            this.checkSafeNavigationForEvent(event);
        });


        onEventChildren(document.body, 'click', '#new-app-btn', (event) => {
            var newAppModal = $FMODAL('#new-app-modal');
            let alert = newAppModal.querySelector('.alert')!;
            alert.classList.add('d-none');
            let nameInput: HTMLInputElement = newAppModal.querySelector('input[name="appName"]') as HTMLInputElement;
            nameInput.value = '';

            newAppModal.querySelector("form")!.onsubmit = (event) => {

                event.preventDefault();

                var appName = nameInput.value;
                if (typeof appName !== 'string') { console.warn("Invalid app name", appName); return }
                var basedOnApp = (newAppModal.querySelector("select[name=basedOnApp]") as HTMLSelectElement).value;
                if (typeof basedOnApp !== 'string') { console.warn("Invalid base app name", basedOnApp); return }

                let tenantName = BACKEND_SERVICE().tenantName;
                BACKEND_SERVICE().putEvent(new ServerEventNewApp(tenantName, appName, basedOnApp != '-' ? basedOnApp : undefined))
                    .then(async (ev: ServerEventNewEntity) => {
                        if (ev.state_ != 'ABORT') {
                            await this.loadApps();
                            newAppModal.querySelector('.alert')!.classList.replace('d-block', 'd-none');
                            $FMODAL(newAppModal, 'hide');
                            window.location.hash = `#/${tenantName}/${appName}/index.html`;
                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                        return ev;
                    })

            };
        });

        onEvent(document.body, 'click', '#new-table-btn, #new-table-btn *', (event) => {
            var newTableModal = $FMODAL('#new-table-modal');
            let alert = newTableModal.querySelector('.alert')!;
            alert.classList.add('d-none');
            let nameInput: HTMLInputElement = newTableModal.querySelector('input[name="tableName"]') as HTMLInputElement;
            nameInput.value = '';

            newTableModal.querySelector("form")!.onsubmit = (event) => {

                var name = nameInput.value;
                if (typeof name !== 'string') { console.warn("Invalid table name", name); return }
                event.preventDefault();

                BACKEND_SERVICE().putEvent(new ServerEventNewEntity(name))
                    .then(async (ev: ServerEventNewEntity) => {
                        if (ev.state_ != 'ABORT') {
                            await this.loadTables(ev.path);
                            newTableModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                            $FMODAL(newTableModal, "hide");
                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                        return ev;
                    })

            };
        });

        onEvent(document.body, 'click', '#new-page-btn, #new-page-btn *', (event) => {

            var newPageModal = $FMODAL('#new-page-modal');
            let titleInput: HTMLInputElement = newPageModal.querySelector('input[name="title"]') as HTMLInputElement;
            let startTemplateSel: HTMLSelectElement = newPageModal.querySelector('select[name=startTemplateUrl]') as HTMLSelectElement;
            let alert = newPageModal.querySelector('.alert')!;
            alert.classList.add('d-none');

            newPageModal.querySelector("form")!.onsubmit = (event) => {

                var title = titleInput.value;
                var startTemplateUrl = startTemplateSel.value.replace(/^#/, '');

                //replace nonalphanumeric with dashes and lowercase for name
                var name = title.replace(/\W+/g, '-').replace(/[^_A-Za-z0-9]+/g, '_').toLowerCase() + '.html';

                event.preventDefault();
                BACKEND_SERVICE().putEvent(new ServerEventNewPage(name, startTemplateUrl))
                    .then(async (ev: ServerEventNewPage) => {
                        if (ev.state_ != 'ABORT' || ev.error_) {
                            window.location.hash = `${this.EditorState.tenantName}/${this.EditorState.appName}/${ev.newPageName}`;
                            newPageModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                            $FMODAL(newPageModal, "hide");
                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                    });
            };
        });

        onEvent(document.body, 'click', '#save-btn, #save-btn *', async (event) => {
            await this.saveBlobs();

            $SAVE_DOC_PAGE(window.location.pathname, this.frameDoc);
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

        onDoc("UserSelectedCell", "frmdb-data-grid", async (event) => {
            let formulaEditor: FormulaEditorComponent = queryFormulaEditor(document);
            let dataGrid = queryDataGrid(document);

            let entity: Entity = BACKEND_SERVICE().currentSchema.entities[dataGrid.tableName || ''];
            let prop: EntityProperty | undefined = entity.props[dataGrid.selectedColumnName || ''];
            formulaEditor.frmdbState.editedEntity = entity;
            formulaEditor.frmdbState.editedProperty = prop;
        });

        onDoc("FrmdbFormulaEditorChangedColumnsHighlightEvent", "frmdb-formula-editor", async (event) => {
            let formulaEditor = queryFormulaEditor(document);
            let dataGrid = queryDataGrid(document);
            if (formulaEditor.frmdbState.formulaHighlightedColumns) {
                dataGrid.highlightColumns = formulaEditor.frmdbState.formulaHighlightedColumns;
            }
        });

        onEvent(document.body, 'FrmdbIconsCssChanged', '*', (event) => {
            (document.head.querySelector('#frmdb-icons-css') as any).href += "";
            (this.frameDoc.head.querySelector('#frmdb-icons-css') as any).href += "";
        });

        onEvent(document.body, 'FrmdbAddColumn', '*', (event) => {
            let currentEntity: Entity | undefined = this.EditorState.tables.find(e => e._id == this.EditorState.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.EditorState.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            var newColumnModal = $FMODAL('#new-column-modal');
            newColumnModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
            let colNameInput = newColumnModal.querySelector('input[name=columnName]') as HTMLInputElement;
            colNameInput.value = '';
            let alert = newColumnModal.querySelector('.alert')!;
            alert.classList.add('d-none');

            newColumnModal.querySelector("form")!.onsubmit = (event) => {

                var name = colNameInput.value;
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
                            newColumnModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                            $FMODAL(newColumnModal, "hide");

                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                    })
            };
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
        onEventChildren(document.body, 'click', '#preview-btn', (event) => {
            preview = !preview;
            if (preview) {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "34px");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "0px");
                this.dataGrid.style.display = 'none';
                this.letPanel.style.display = 'none';
                this.highlightBox.disabled = true;
                this.iframe.contentWindow!.document.body.classList.add('frmdb-editor-preview');
                this.iframe.contentWindow!.document.body.classList.remove('frmdb-editor-normal');
            } else {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "28vh");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "14vw");
                this.dataGrid.style.display = 'block';
                this.letPanel.style.display = 'block';
                this.highlightBox.disabled = false;
                this.iframe.contentWindow!.document.body.classList.remove('frmdb-editor-preview');
                this.iframe.contentWindow!.document.body.classList.add('frmdb-editor-on', 'frmdb-editor-normal');
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

    async loadApps() {
        let apps: string[] = await fetch(`/formuladb-api/${BACKEND_SERVICE().tenantName}/app-names`)
            .then(response => {
                return response.json();
            });

        this.EditorState.apps = apps.map(a => ({
            name: a,
            url: `#/${BACKEND_SERVICE().tenantName}/${a}/index.html`
        }));
        this.updateCurrentApp();
    }

    updateCurrentApp() {
        let { tenantName, appName } = parsePageUrl(window.location.pathname);
        this.EditorState.selectedAppName = appName;
        updateDOM({ $frmdb: this.EditorState }, document.body);
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
        let app: App | null = await BACKEND_SERVICE().getApp();
        if (!app) throw new Error(`App not found for ${window.location}`);
        this.EditorState.pages = app.pages
            .filter(p => p.indexOf('_') != 0)
            .map(p => ({
                name: p.replace(/\.html$/, '')/*.replace(/^index$/, 'Home Page')*/,
                url: `#/${BACKEND_SERVICE().tenantName}/${BACKEND_SERVICE().appName}/${p}`
            }));
        this.updateCurrentPage();
    }

    updateCurrentPage() {
        let pagePath = window.location.hash.replace(/^#/, '');
        this.EditorState.selectedPagePath = pagePath;
        this.EditorState.selectedPageName = (pagePath || 'index').replace(/.*\//, '').replace(/\.html$/, '');
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
                let columnId = attrib.value.replace(/^\$FRMDB\./, '').replace(/.*:/, '').replace(`${tableName}[].`, '');
                return { recordId, columnId };
            }
        }

        if (isElementWithTextContent(el)) {
            let recordId = `$Dictionary~~${getTranslationKey(el)}`;
            let columnId = document.documentElement.lang;
            if (columnId == DEFAULT_LANGUAGE) columnId = '_id';
            return { recordId, columnId };
            // return null; //disable highlight on $Dictionary table for now, because it is not a "normal" dynamic data-binding, the $Dictionary table is used only during server side rendering
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
            '$HIGHLIGHT-RECORD$': { _id: recordId },
        };
        this.changeSelectedTableIdIfDifferent(tableName);
        dataGrid.debouncedForceCellRefresh();
    }


    async saveBlobs() {

        let appBackend = BACKEND_SERVICE();
        for (let frmdbBlob of Object.values(BLOBS.blobs)) {
            if (frmdbBlob.type === "image" && frmdbBlob.el) {
                let newSrc = await appBackend.saveMedia(frmdbBlob.fileName, frmdbBlob.blob);
                frmdbSetImageSrc(frmdbBlob.el, newSrc);
            }
        }
    }
}
