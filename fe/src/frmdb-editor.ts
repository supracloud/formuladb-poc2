import { onDoc, onEvent } from './delegated-events';
import { queryFormulaEditor } from './formula-editor/formula-editor.component';

import './highlight-box/highlight-box.component';
import './dom-tree/dom-tree.component';
import './frmdb-editor/frmdb-editor.component';
import { BACKEND_SERVICE } from './backend.service';
import { EntityProperty, Entity, Pn } from '@domain/metadata/entity';
import './directives/data-frmdb-select.directive';
import { ServerEventDeleteProperty, ServerEventSetProperty, ServerEventDeleteEntity, ServerEventNewEntity, ServerEventPreviewFormula, ServerEventPutPageHtml, ServerEventNewPage, ServerEventDeletePage } from '@domain/event';
import { UserDeleteColumn } from './frmdb-user-events';
import { elvis } from '@core/elvis';
import { updateDOM } from './live-dom-template/live-dom-template';
import { App } from '@domain/app';
import { _resetAppAndTenant } from './app.service';
import { I18N_FE, isElementWithTextContent, getTranslationKey, DEFAULT_LANGUAGE } from './i18n-fe';
import { entityNameFromDataObjId } from '@domain/metadata/data_obj';
import { DATA_FRMDB_ATTRS_Enum } from './live-dom-template/dom-node';
import { getParentObjId } from './form.service';
import { normalizeDOM2HTML } from '@core/normalize-html';
import './fe-functions';
import { FrmdbAppState } from './frmdb-app-state';
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from '@domain/constants';
import { FrmdbEditorBuilder } from './frmdb-editor-builder';
import { FrmdbEditorGui } from './frmdb-editor-gui';
import './theme-customizer/theme-customizer.component';

class FrmdbEditorState extends FrmdbAppState {
    selectedTableId: string;
}

let EditorState: FrmdbEditorState = new FrmdbEditorState('n-a-tenant', 'n-a-app');

window.onpopstate = () => {
    _resetAppAndTenant();
    initEditor(window.location.hash.replace(/^#/, ''));
}

window.addEventListener('DOMContentLoaded', (event) => {
    // initEditor(window.location.hash.replace(/^#/, ''));
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
        let builder = new FrmdbEditorBuilder(iframe);
        builder.init();
        let builderGui = new FrmdbEditorGui(builder, iframe);
        builderGui.init();
    }
}
