import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";
import { html } from "@fe/live-dom-template/live-dom-template";


var themeStylesheetElement: HTMLLinkElement | null;
function loadExternalStyles(styleUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
        themeStylesheetElement = document.createElement('link');
        themeStylesheetElement.rel = 'stylesheet';
        themeStylesheetElement.href = styleUrl;
        themeStylesheetElement.onload = resolve;
        document.head.appendChild(this.themeStylesheetElement);
    });
}

function loadExternalScript(scriptUrl: string): Promise<any> {
    return new Promise(resolve => {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.onload = resolve;
        document.body.appendChild(scriptElement);
    });
}

export class StartMenuComponent extends HTMLElement {
    rootEl: HTMLElement | undefined;
    highlightEl: HTMLElement | undefined;
    private frmdbEditor: HTMLElement | undefined = undefined;
    static observedAttributes = ['root-element'];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {

        this.shadowRoot!.innerHTML = html`
            <style>
                :host {
                    display: block;
                    position: fixed;
                    right: 5px;
                    bottom: 5px;
                }
            </style>
            <img src="/formuladb-static/formuladb.io/favicon.png" />
        `;

        this.addEventListener('click', () => {
            this.toggleFrmdbEditor();
        });        
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.rootEl = document.querySelector(newVal);
    }

    toggleFrmdbEditor() {
        if (!this.frmdbEditor) {
            loadExternalScript('/formuladb/frmdb-editor.js')
            .then(() => {
                this.frmdbEditor = document.createElement('frmdb-editor');
                document.body.appendChild(this.frmdbEditor);
            });
        } else {
            if (document.body.contains(this.frmdbEditor)) {
                document.body.removeChild(this.frmdbEditor);
            } else {
                document.body.appendChild(this.frmdbEditor);
            }
        }
    }
}

customElements.define('frmdb-start-menu', StartMenuComponent);
