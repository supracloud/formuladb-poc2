import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";
import './table-list.component';
import { BACKEND_SERVICE } from "@fe/backend.service";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/frmdb-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/frmdb-editor.component.scss').default;

export class FrmdbEditorComponent extends HTMLElement {
    static observedAttributes = ['root-element'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;
    }

    connectedCallback() {
        document.body.style.setProperty('--frmdb-editor-top-panel-height', "30vh");
        document.body.style.setProperty('--frmdb-editor-left-panel-width', "15vw");
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
		$introVideoModal.modal("show").on('hidden.bs.modal', function (e) {
			($introVideoModal.find('video')[0] as HTMLVideoElement).pause();
		});
	}    
}

customElements.define('frmdb-editor', FrmdbEditorComponent);
