import './router';
import './fragment/fragment.component';
import { initFrmdb } from './init';
import './form/form.component';
import './icon/icon.components';

import './directives/data-frmdb-select.directive';
import './fe-functions';
import * as _ from "lodash";

import './data-grid/data-grid.component';

import {FrmdbEditorDirective} from './frmdb-editor/frmdb-editor.directive';
import { PageOpts, isEditorMode } from '@domain/url-utils';

export class FrmdbFeComponent extends HTMLElement {
    rootEl: HTMLElement | undefined;
    highlightEl: HTMLElement | undefined;
    private frmdbEditor: HTMLElement | undefined = undefined;
    static observedAttributes = ['root-element'];
    initilialized = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = /*html*/`
            <style>
                :host {
                    display: block;
                    position: fixed;
                    right: 5px;
                    bottom: 5px;
                }
            </style>
            ${window.location !== window.parent.location || window.location.pathname === '/formuladb/editor.html' ? '' : /*html*/`
                <a href="/formuladb/editor.html#${window.location.pathname}"><img src="/formuladb-env/static/formuladb_io/favicon.png" /></a>
            `}
        `;

    }

    connectedCallback() {
        initFrmdb();

        if (isEditorMode(window.location.search)) {
            new FrmdbEditorDirective()
                .init();
        }

        this.addEventListener('click', () => {
            this.toggleFrmdbEditor();
        });
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.rootEl = document.querySelector(newVal);
    }

    toggleFrmdbEditor() {
        if (!this.frmdbEditor) {
            this.frmdbEditor = document.createElement('frmdb-editor');
            document.body.appendChild(this.frmdbEditor);
        } else {
            if (document.body.contains(this.frmdbEditor)) {
                document.body.removeChild(this.frmdbEditor);
            } else {
                document.body.appendChild(this.frmdbEditor);
            }
        }
    }

    loadedStyleSheets: { [x: string]: HTMLLinkElement } = {};
    loadedScripts: { [x: string]: HTMLScriptElement } = {};
    inlineStyles: { [x: string]: HTMLStyleElement } = {};

    loadExternalStyleSheet(styleUrl: string): Promise<any> {
        if (this.loadedStyleSheets[styleUrl]) return Promise.resolve();
        return new Promise((resolve, reject) => {
            let fontStylesheetElement = document.createElement('link');
            fontStylesheetElement.rel = 'stylesheet';
            fontStylesheetElement.href = styleUrl;
            fontStylesheetElement.onload = resolve;
            document.head.appendChild(fontStylesheetElement);
            this.loadedStyleSheets[styleUrl] = fontStylesheetElement;
        });
    }

    loadExternalScript(scriptUrl: string): Promise<any> {
        if (this.loadedScripts[scriptUrl]) return Promise.resolve();
        return new Promise(resolve => {
            const scriptElement = document.createElement('script');
            scriptElement.src = scriptUrl;
            scriptElement.onload = resolve;
            this.loadedScripts[scriptUrl] = scriptElement;
            document.body.appendChild(scriptElement);
        });
    }

    loadinlineStyle(style: string): Promise<any> {
        if (this.inlineStyles[style]) return Promise.resolve();
        return new Promise((resolve, reject) => {
            let styleEl = document.createElement('style');
            let fontTxtNode = document.createTextNode(style);
            styleEl.appendChild(fontTxtNode);
            this.inlineStyles[style] = styleEl;
            document.head.appendChild(styleEl);
        });
    }

}

customElements.define('frmdb-fe', FrmdbFeComponent);
if (document.querySelector('frmdb-fe') == null) {
    document.body.appendChild(document.createElement('frmdb-fe'));
}
