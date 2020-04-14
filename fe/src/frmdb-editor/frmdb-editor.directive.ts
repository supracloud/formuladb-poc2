import * as _ from "lodash";
import { onEvent, onDoc, getTarget, onEventChildren } from "@fe/delegated-events";
import { BACKEND_SERVICE, RESET_BACKEND_SERVICE, BackendService, getData } from "@fe/backend.service";
import { Entity, EntityProperty, Pn } from "@domain/metadata/entity";
import { ServerEventNewEntity, ServerEventSetPage, ServerEventPutPageHtml, ServerEventDeleteEntity, ServerEventDeletePage, ServerEventSetProperty, ServerEventDeleteProperty, ServerEventPutMediaObject, ServerEventSetApp } from "@domain/event";
import { queryDataGrid, DataGridComponentI } from "@fe/data-grid/data-grid.component.i";
import { queryFormulaEditor, FormulaEditorComponent } from "@fe/formula-editor/formula-editor.component";
import { queryTableEditor, TableEditorComponent } from "@fe/table-editor/table-editor.component";
import { UserDeleteColumn, FrmdbAddPageElementStart } from "@fe/frmdb-user-events";
import { DATA_FRMDB_ATTRS_Enum } from "@fe/live-dom-template/dom-node";
import { getParentObjId } from "@fe/form.service";
import { entityNameFromDataObjId, parseDataObjId } from "@domain/metadata/data_obj";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from "@domain/constants";

import { FrmdbFeComponentI, queryFrmdbFe } from "@fe/fe.i";
import '../directives/data-toggle-tab.directive';
import '../directives/data-toggle-modal.directive';

import { App } from "@domain/app";
import { $SAVE_DOC_PAGE, $ID } from "@fe/fe-functions";

import { launchFullScreen } from "@fe/frmdb-editor-gui";

import "@fe/component-editor/component-editor.component";
import { ComponentEditorComponent } from "../component-editor/component-editor.component";

import "./element-tree.component";
import { ElementTreeComponent } from "./element-tree.component";

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
import { frmdbSetImageSrc } from "@fe/component-editor/_old_components-frmdb";
import { Undo } from "./undo";
import { $FRMDB_MODAL } from "../directives/data-toggle-modal.directive";
import { I18N_UTILS, isElementWithTextContent, getTranslationKey } from "@core/i18n-utils";
import { DEFAULT_LANGUAGE, I18nLang } from "@domain/i18n";
import { parseAllPageUrl, AllPageOpts, makeUrlPath, makeSeoFriendlyUrl } from "@domain/url-utils";
import { registerFrmdbEditorRouterHandler, navigateEditorToPage, navigateEditorToAppAndPage, navigateTo } from "./frmdb-editor-router";
import { registerChangesFeedHandler, hookIframeChangesFeedHandlers } from "@fe/changes-feed-client";
import { ElementEditorComponent } from "@fe/element-editor/element-editor.component";
import { DATA_BINDING_MONITOR } from "@fe/init";
import { $Table, $PageObjT, $Page, $AppObjT } from "@domain/metadata/default-metadata";
import { waitUntil } from "@domain/ts-utils";
import { FrmdbElementState } from "@fe/frmdb-element-state";
import { serializeElemToObj, updateDOM } from "@fe/live-dom-template/live-dom-template";
import { isHTMLElement } from "@core/html-tools";
import { getPageProperties } from "@core/dom-utils";
import * as events from "@domain/event";
import { raiseNotification } from "@fe/notifications.service";
import { ThemeColors } from "@domain/uimetadata/theme";

declare var $: null, jQuery: null;

class FrmdbEditorState {
    selectedAppName: string;
    selectedPageName: string;
    selectedPagePath: string;
    selectedTableId: string;
    tables: Entity[];

    constructor(public appName: string) {
    }
}

export class FrmdbEditorDirective {
    static observedAttributes = ['root-element'];
    state: FrmdbElementState<FrmdbEditorState>;
    frmdbFe: FrmdbFeComponentI;
    iframe: HTMLIFrameElement;
    canvas: HTMLDivElement;
    dataGrid: DataGridComponentI;
    letPanel: HTMLElement;
    elementEditor: ElementEditorComponent;
    addElementCmp: AddElementComponent;
    imgEditorCmp: ImgEditorComponent;
    iconEditorCmp: IconEditorComponent;
    elementTree: ElementTreeComponent;
    componentEditor: ComponentEditorComponent;
    themeCustomizer: ThemeCustomizerComponent;

    get frameDoc(): Document {
        return this.iframe.contentWindow!.document;
    }

    setIframeSrc(newUrl: URL) {
        let searchStr = '';
        if (newUrl.search) {
            let p = new URLSearchParams(newUrl.search);
            p.delete('frmdbRender');
            searchStr = '?' + p.toString();
        }
        
        if (this.iframe?.contentWindow?.location?.pathname != newUrl.pathname) {
            this.iframe.src = newUrl.pathname + searchStr;
        }

    }

    updateStateFromUrl(newPageOpts: AllPageOpts, newUrl: URL) {
        let { appName } = newPageOpts;

        this.setIframeSrc(newUrl);

        if (this.state.data.selectedAppName != appName) {
            RESET_BACKEND_SERVICE();
            BACKEND_SERVICE().waitFrmdbEngineTools()
                .then(async () => {
                    await DATA_BINDING_MONITOR?.updateDOMForRoot();
                });
        }

        waitUntil(() => DATA_BINDING_MONITOR)
            .then(() => {
                DATA_BINDING_MONITOR!.updateDOMForRoot($Page._id);
            });

        this.state.emitChange({
            selectedAppName: appName,
            selectedPageName: newPageOpts.pageName,
        });
    }

    init() {
        let appName = BACKEND_SERVICE().appName;
        this.state = new FrmdbElementState(document.body, new FrmdbEditorState(appName));

        (window as any).$FRMDB_EDITOR = this;
        this.iframe = document.body.querySelector('iframe#app')! as HTMLIFrameElement;
        this.canvas = document.body.querySelector('#canvas') as HTMLDivElement;
        this.componentEditor = document.body.querySelector('frmdb-component-editor') as ComponentEditorComponent;
        this.frmdbFe = queryFrmdbFe();
        this.dataGrid = queryDataGrid(document.body);
        this.letPanel = document.body.querySelector('.left-panel') as HTMLElement;
        this.elementEditor = document.body.querySelector('frmdb-element-editor') as ElementEditorComponent;
        this.addElementCmp = document.body.querySelector('frmdb-add-element') as AddElementComponent;
        this.imgEditorCmp = document.body.querySelector('frmdb-img-editor') as ImgEditorComponent;
        this.iconEditorCmp = document.body.querySelector('frmdb-icon-editor') as IconEditorComponent;
        this.elementTree = document.body.querySelector('frmdb-element-tree') as ElementTreeComponent;
        this.themeCustomizer = document.body.querySelector('frmdb-theme-customizer') as ThemeCustomizerComponent;

        this.tableManagementFlows();
        this.tableColumnManagementFlows();
        this.viewManagementFlows();
        let ff = () => {
            this.elementEditor.rootEl = this.iframe.contentWindow!.document.body;
            this.iframe.contentWindow!.document.body.classList.add('frmdb-editor-on', 'frmdb-editor-normal');
            pageElementFlows(this);
            hookIframeChangesFeedHandlers(this.iframe.contentWindow!);
            // this.manageIframeNavigation();
            if (this.iframe.contentWindow?.location && window.location.pathname != this.iframe.contentWindow.location.pathname) {
                let {appName, pageName} = parseAllPageUrl(this.iframe.contentWindow.location.pathname);
                navigateEditorToAppAndPage(appName, pageName, this.iframe.contentWindow.location.search);
            }
        }
        this.iframe.onload = ff;

        //FIXME: Ugly Workaround for e2e where onload is not getting called:
        setTimeout(ff, 2000);
        this.setIframeSrc(new URL(window.location.href));

        let newPageOpts = parseAllPageUrl(window.location.pathname);
        this.state.emitChange({
            selectedAppName: newPageOpts.appName,
            selectedPageName: newPageOpts.pageName,
        });

        waitUntil(() => DATA_BINDING_MONITOR)
            .then(() => {
                DATA_BINDING_MONITOR!.registerDataBindingChangeHandler('frmdb-editor', async (tableName: string, data: any[]) => {
                    if (tableName == $Table._id) {
                        this.state.emitChange({
                            selectedTableId: data?.[0]?._id,
                            tables: data as Entity[],
                        })
                    }
                });
            });

        this.addElementCmp.addEventListener('FrmdbAddPageElementStart', (event: CustomEvent) => {
            let evDetail: FrmdbAddPageElementStart = event.detail;
            this.elementEditor.addElement(evDetail.htmlElement);
        })

        registerFrmdbEditorRouterHandler('editor-iframe-src',
            (newUrl: URL, oldPageOpts: AllPageOpts, newPageOpts: AllPageOpts) => this.updateStateFromUrl(newPageOpts, newUrl),
            () => this.checkSafeNavigation()
        );

        getData('/formuladb-api/user').then((u: {userRole: string, userId: string}) => {
            if (u.userRole === "$ANONYMOUS") {
                let {lang} = parseAllPageUrl(window.location.pathname);
                raiseNotification(ThemeColors.warning, 
                    "WARNING this is a preview environment.", 
                    `To be able to save your modifications, please <a href="/${lang}/users/login.html" target="_blank">Login</a> or <a href="/${lang}/users/register.html" target="_blank">Register</a>`)
            }
        })
    }

    public changeTable(a: HTMLAnchorElement) {
        this.state.emitChange({ selectedTableId: a.innerText });
    }

    showIntroVideoModal() {
        let introVideoModal = $FRMDB_MODAL('#intro-video-modal');
        introVideoModal.querySelector('video')!.setAttribute('src', `/formuladb-env/static/${BACKEND_SERVICE().appName}/intro.webm`);
        introVideoModal.addEventListener('FrmdbModalCloseEvent', (e) => {
            (introVideoModal.querySelector('video')! as HTMLVideoElement).pause();
        });
    }

    iframeHistory: string[] = [];
    manageIframeNavigation() {

        if (this.iframe.contentWindow) this.iframe.contentWindow.onpopstate = () => {
            let prevUrl = this.iframeHistory.pop();
            if (prevUrl) {
                let url = new URL(prevUrl);
                let {appName, pageName} = parseAllPageUrl(url.pathname);
                navigateEditorToAppAndPage(appName, pageName, url.search);
            } 
        };

        onEventChildren(this.frameDoc.body, ['click'], 'a', (event: MouseEvent) => {
            let link: HTMLLinkElement | null = null;
            if (isHTMLElement(event.target)) {
                if (event.target.matches('a')) link = event.target as HTMLLinkElement;
                else link = event.target.closest('a') as any as HTMLLinkElement;
            }
            if (link) {
                let url = new URL(link.href);
                let newPathname = url.pathname;
                if (window.location.pathname != newPathname) {

                    if (this.iframe.contentWindow?.location.href) this.iframeHistory.push(this.iframe.contentWindow?.location.href);

                    let {appName, pageName} = parseAllPageUrl(newPathname);
                    navigateEditorToAppAndPage(appName, pageName, url.search);
                }
            }
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
        if (tableName === this.state.data.selectedTableId) return;
        this.state.emitChange({ selectedTableId: tableName });
    }

    selectElement(el: HTMLElement | null) {
        if (el != this.elementEditor.state.selectedEl) {
            this.elementEditor.selectElement(el);
        }
        if (el) {
            this.highlightDataGridCell(el);
            this.componentEditor.setEditedEl(el);
            this.elementTree.render(el);
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

        onEventChildren(document.body, 'click', '#new-app-btn, #edit-app-btn', (event) => {
            if (isHTMLElement(event.target) && (event.target.matches('#edit-app-btn') || event.target.closest('#edit-app-btn'))) {
                this.setAppProperties(false);
            } else {
                this.setAppProperties(true);
            }
        });

        onEvent(document.body, 'click', '#new-table-btn, #new-table-btn *', (event) => {
            var newTableModal = $FRMDB_MODAL('#new-table-modal');
            let alert = newTableModal.querySelector('.alert')!;
            alert.classList.add('d-none');
            let nameInput: HTMLInputElement = newTableModal.querySelector('input[name="tableName"]') as HTMLInputElement;
            nameInput.value = '';

            newTableModal.querySelector("form")!.onsubmit = (event) => {

                var name = nameInput.value;
                if (typeof name !== 'string') { console.warn("Invalid table name", name); return }
                event.preventDefault();

                let {appName} = parseAllPageUrl(window.location.pathname);
                BACKEND_SERVICE().putEvent(new ServerEventNewEntity(appName, name))
                    .then(async (ev: ServerEventNewEntity) => {
                        if (ev.state_ != 'ABORT') {
                            newTableModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                            $FRMDB_MODAL(newTableModal, "hide");
                            this.state.emitChange({ selectedTableId: ev.entityId });
                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                        return ev;
                    })

            };
        });

        onEventChildren(document.body, 'click', '#new-page-btn, #edit-page-btn', (event: MouseEvent) => {
            if (isHTMLElement(event.target) && (event.target.matches('#edit-page-btn') || event.target.closest('#edit-page-btn'))) {
                this.setPageProperties(false);
            } else {
                this.setPageProperties(true);
            }
        });

        onEvent(document.body, 'click', '#save-btn, #save-btn *', async (event) => {
            await this.saveBlobs();

            await $SAVE_DOC_PAGE(window.location.pathname, this.frameDoc)
            .then(b => {
                if (b) Undo.clear();
                let pageOpts = parseAllPageUrl(window.location.pathname);
                let { appName, lang, pageName } = pageOpts;
                navigateTo(makeSeoFriendlyUrl(pageOpts));
            });
        });

        onDoc('click', '#delete-table-btn *', (event) => {
            let link: HTMLAnchorElement = getTarget(event)!.closest('a')!;
            event.preventDefault();
            let tableName: string | undefined = (link as any).tableToDelete;
            if (!tableName) return;

            if (confirm(`Please confirm deletion of table ${link.dataset.id} ?`)) {
                BACKEND_SERVICE().putEvent(new ServerEventDeleteEntity(tableName));
            }
        });

        onEventChildren(document.body, 'click', '#delete-app-btn', (event) => {
            if (confirm(`Please confirm deletion of page ${this.state.data.selectedPageName} ?`)) {

                // BACKEND_SERVICE().putEvent(new ServerEventDeleteAp(window.location.pathname))
                //     .then(async (ev: ServerEventDeletePage) => {
                //         if (ev.state_ != 'ABORT') {
                //             navigateEditorToPage('index');
                //         }
                //         return ev;
                //     });
            }
        });

        onEventChildren(document.body, 'click', '#delete-page-btn', (event) => {
            if (confirm(`Please confirm deletion of page ${this.state.data.selectedPageName} ?`)) {

                BACKEND_SERVICE().putEvent(new ServerEventDeletePage(window.location.pathname))
                    .then(async (ev: ServerEventDeletePage) => {
                        if (ev.state_ != 'ABORT') {
                            navigateEditorToPage('index');
                        }
                        return ev;
                    });
            }
        });

        onDoc('FrmdbColumnChanged', '*', (event) => {
            this.dataGrid.forceReloadData();
        });

        registerChangesFeedHandler("editorDataGridMonitor", async (events: events.MwzEvents[]) => {
            for (let event of events) {
                if (event.type_ === "ServerEventModifiedFormData" || event.type_ === "ServerEventDeletedFormData") {
                    let { entityId } = parseDataObjId(event.obj._id);
                    if (this.state.data.selectedTableId == entityId) {
                        this.dataGrid.forceReloadData();
                    }
                }
            }
        });

    }

    async setAppProperties(isNewApp: boolean) {
        var newAppModal = $FRMDB_MODAL('#new-app-modal');
        let alert = newAppModal.querySelector('.alert')!;
        alert.classList.add('d-none');

        let setAppModalState: any = {
            isNewApp,
            isExisingApp: !isNewApp,
            buttonText: isNewApp ? 'Create App' : 'Save App Properties',
        };
        if (isNewApp) {
        } else {
            let app = await BACKEND_SERVICE().getAppProperties(this.state.data.selectedAppName);
            setAppModalState = {
                ...app,
                ...setAppModalState, 
                name: this.state.data.selectedAppName,
            };
        }
        updateDOM(setAppModalState, newAppModal);

        newAppModal.querySelector("form")!.onsubmit = (event) => {

            event.preventDefault();

            let appObj: $AppObjT = serializeElemToObj(newAppModal) as any;
            let {appName} = parseAllPageUrl(window.location.pathname);
            if (isNewApp) appName = appObj.name;

            if (typeof appName !== 'string') { console.warn("Invalid app name", appName); return }
            var basedOnApp = (newAppModal.querySelector("select[name=basedOnApp]") as HTMLSelectElement).value;
            if (typeof basedOnApp !== 'string') { console.warn("Invalid base app name", basedOnApp); return }

            BACKEND_SERVICE().putEvent(new ServerEventSetApp(appName, appObj.category, appObj.description, basedOnApp != '-' ? basedOnApp : undefined))
                .then(async (ev: ServerEventSetApp) => {
                    if (ev.state_ != 'ABORT') {
                        newAppModal.querySelector('.alert')!.classList.replace('d-block', 'd-none');
                        $FRMDB_MODAL(newAppModal, 'hide');
                        if (isNewApp) {
                            navigateEditorToAppAndPage(appName, 'index', '');
                        }
                    } else {
                        alert.classList.replace('d-none', 'd-block');
                        alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                    }
                    return ev;
                })

        };
    }

    setPageProperties(isNewPage: boolean) {

        var newPageModal = $FRMDB_MODAL('#new-page-modal');
        let startTemplateSel: HTMLSelectElement = newPageModal.querySelector('select[name=startTemplateUrl]') as HTMLSelectElement;
        let alert = newPageModal.querySelector('.alert')!;
        alert.classList.add('d-none');

        let setPageModalState: any = {
            isNewPage,
            isExisingPage: !isNewPage,
            buttonText: isNewPage ? 'Create Page' : 'Save Page Properties',
        };
        if (!isNewPage) setPageModalState = {...setPageModalState, ...getPageProperties(this.frameDoc), name: this.state.data.selectedPageName}
        updateDOM(setPageModalState, newPageModal);

        newPageModal.querySelector("form")!.onsubmit = (event) => {
            event.preventDefault();

            let pageObj: $PageObjT = serializeElemToObj(newPageModal) as any;

            //replace nonalphanumeric with dashes and lowercase for name
            pageObj.name = pageObj.name.replace(/[^a-zA-Z0-9]/g, '-');

            let pageOpts = parseAllPageUrl(window.location.pathname);
            if (isNewPage) pageOpts = {...pageOpts, pageName: pageObj.name};

            BACKEND_SERVICE().putEvent(
                new ServerEventSetPage(
                    pageOpts, 
                    pageObj,
                    isNewPage ? startTemplateSel.value : this.state.data.selectedPageName
                )
            )
                .then(async (ev: ServerEventSetPage) => {
                    if (ev.state_ != 'ABORT' || ev.error_) {
                        newPageModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                        $FRMDB_MODAL(newPageModal, "hide");
                        navigateEditorToPage(ev.pageObj.name);
                    } else {
                        alert.classList.replace('d-none', 'd-block');
                        alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                    }
                });
        };
    }

    tableColumnManagementFlows() {

        onDoc("UserSelectedCell", "frmdb-data-grid", async (event) => {
            let formulaEditor: FormulaEditorComponent = queryFormulaEditor(document);
            let dataGrid = queryDataGrid(document);

            let entity: Entity = (await BACKEND_SERVICE().getCurrentSchema()).entities[dataGrid.tableName || ''];
            let prop: EntityProperty | undefined = entity.props[dataGrid.selectedColumnName || ''];
            formulaEditor.frmdbState.editedEntity = entity;
            formulaEditor.frmdbState.editedProperty = prop;
        });
        onDoc("UserSelectedRow", "frmdb-data-grid", async (event) => {
            let tableEditor: TableEditorComponent = queryTableEditor(document);
            let dataGrid = queryDataGrid(document);
            tableEditor.selectedRecord = dataGrid.selectedRow;
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
            let currentEntity: Entity | undefined = this.state.data.tables?.find(e => e._id == this.state.data.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.state.data.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            if (entity._id.indexOf('$') === 0) { window.alert(`Default system table ${entity._id} cannot be modified.`); return}

            var newColumnModal = $FRMDB_MODAL('#new-column-modal');
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
                            let tableEditor = queryTableEditor(document.body);
                            newColumnModal.querySelector('.alert')!.classList.replace('d-block', 'd-none')
                            $FRMDB_MODAL(newColumnModal, "hide");

                        } else {
                            alert.classList.replace('d-none', 'd-block');
                            alert.innerHTML = ev.notifMsg_ || ev.error_ || JSON.stringify(ev);
                        }
                    })
            };
        });

        onEvent(document.body, 'UserDeleteColumn', '*', (event: CustomEvent<UserDeleteColumn>) => {
            let currentEntity: Entity | undefined = this.state.data.tables?.find(e => e._id == this.state.data.selectedTableId);
            if (!currentEntity) { console.warn(`Entity ${this.state.data.selectedTableId} does not exist`); return; }
            let entity: Entity = currentEntity;

            if (confirm(`Please confirm deletion of table ${event.detail.tableName}.${event.detail.columnName} ?`)) {
                if (entity._id != event.detail.tableName) { console.warn(`ERR ${entity._id} != ${event.detail.tableName}`); return; }
                BACKEND_SERVICE().putEvent(new ServerEventDeleteProperty(entity, event.detail.columnName))
                    .then(async (ev: ServerEventDeleteProperty) => {
                        if (ev.state_ != 'ABORT') {
                            let dataGrid = queryDataGrid(document.body);
                            await dataGrid.initAgGrid();
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

        onEventChildren(document.body, 'click', '[data-frmdb-editor-change-app]', (event) => {
            let newAppName: string = event.target.getAttribute('data-frmdb-editor-change-app') || event.target.closest('[data-frmdb-editor-change-app]').getAttribute('data-frmdb-editor-change-app');
            let pageOpts = parseAllPageUrl(window.location.pathname);
            let { lang } = pageOpts;
            navigateTo(makeSeoFriendlyUrl({
                appName: newAppName, lang, pageName: 'index',
            }));
        });

        let preview = false;
        onEventChildren(document.body, 'click', '#preview-btn', (event) => {
            preview = !preview;
            if (preview) {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "34px");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "0px");
                this.dataGrid.style.display = 'none';
                this.letPanel.style.display = 'none';
                this.elementEditor.disabled = true;
                this.iframe.contentWindow!.document.body.classList.add('frmdb-editor-preview');
                this.iframe.contentWindow!.document.body.classList.remove('frmdb-editor-normal');
            } else {
                document.body.style.setProperty('--frmdb-editor-top-panel-height', "28vh");
                document.body.style.setProperty('--frmdb-editor-left-panel-width', "14vw");
                this.dataGrid.style.display = 'block';
                this.letPanel.style.display = 'block';
                this.elementEditor.disabled = false;
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

    getCellFromEl(el: HTMLElement): { recordId: string, columnId: string } | null {
        for (let i = 0; i < (el.attributes || []).length; i++) {
            let attrib = el.attributes[i];
            if (attrib.name === 'data-frmdb-table') {
                let tableName = attrib.value.replace(/^\$FRMDB(\.\$REFERENCE_TO_OPTIONS)?\./, '').replace(/\[\]$/, '');
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

    addPageElement() {
        this.addElementCmp.start();
    }

    reloadCanvas() {
        this.iframe?.contentWindow?.location.reload();
    }
}
