import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";
import { html } from "@fe/live-dom-template/live-dom-template";

const HTML = /*html*/`
    <style>
        frmdb-dom-tree {
            position: fixed;
            top: 40px;
            left: 0;
            width: 16vw;
            height: 50vh;
        }
        .top-panel {
            position: fixed;
            display: block;
            top: 0px;
            left: var(--frmdb-editor-left-panel-width);
            width: calc(100vw - var(--frmdb-editor-left-panel-width) - 18px);
            height: var(--frmdb-editor-top-panel-height);
        }
    </style>
    <div class="top-panel">
        <frmdb-data-grid data-frmdb-attr="table_name:$frmdb.selectedTableId" expand_row="#edit-record-modal" no_floating_filter="true"></frmdb-data-grid>
    </div>
    <frmdb-dom-tree root-element="body"></frmdb-dom-tree>
    <frmdb-highlight-box root-element="body"></frmdb-highlight-box>
`;

export class FrmdbEditorComponent extends HTMLElement {
    rootEl: HTMLElement | undefined;
    highlightEl: HTMLElement | undefined;
    private top: HTMLElement;
    private right: HTMLElement;
    private bottom: HTMLElement;
    private left: HTMLElement;
    static observedAttributes = ['root-element'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = HTML;
    }

    connectedCallback() {
        document.body.style.setProperty('--frmdb-editor-top-panel-height', "30vh");
        document.body.style.setProperty('--frmdb-editor-left-panel-width', "16vw");
    }
    disconnectedCallback() {
        document.body.style.setProperty('--frmdb-editor-top-panel-height', "0px");
        document.body.style.setProperty('--frmdb-editor-left-panel-width', "0px");
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.rootEl = document.querySelector(newVal);
        this.init();
    }

    init() {
        if (!this.rootEl) return;

        onEvent(this.rootEl, 'mousemove', '*', /*_.debounce(*/(event) => {
            // console.log(event.target, window.scrollY, window.scrollX);
            let highlightEl: HTMLElement = event.target as HTMLElement;
            if (!highlightEl.tagName) return;
            if (["frmdb-dom-tree", "frmdb-data-grid", "body"]
                .includes(highlightEl.tagName.toLowerCase())) return;

            let offset = highlightEl.getBoundingClientRect();
            let height = highlightEl.clientHeight;
            let width = highlightEl.clientWidth;

            this.style.top = (offset.top) + 'px';
            this.style.left = (offset.left) + 'px';
            this.style.height = height + 'px';
            this.style.width = width + 'px';
        }/*, 50)*/)
    }
}

customElements.define('frmdb-editor', FrmdbEditorComponent);
