import * as _ from "lodash";
import { onEvent, emit } from "@fe/delegated-events";


export class LookPreviewComponent extends HTMLElement {
    static observedAttributes = ['color', 'look'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    link: HTMLLinkElement | undefined;
    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        let look = this.getAttribute('look');
        let color = this.getAttribute('color');
        if (!look || !color) return;

        color = color.replace(/#/g, '');
        let css = `/formuladb-env/css/${look}-${color}.css`;

        if (!this.link) {
            this.render();
            this.link = document.createElement('link');
            this.link.rel = 'stylesheet';
            this.link.href = css;
            this.shadowRoot!.appendChild(this.link);
        } else {
            this.link.href = css;            
        }

    }


    render() {
        this.shadowRoot!.innerHTML = /*html*/`
            <!--<nav class="navbar navbar-dark bg-dark">
                <a class="navbar-brand" href="javascript:void(0)">Navbar ${this.getAttribute('look')}</a>
            </nav>-->
        
            <h1>${this.getAttribute('look')}</h1>
            <div class="d-flex">
                <button type="button" class="mx-1 btn btn-sm btn-primary">Primary</button>
                <button type="button" class="mx-1 btn btn-sm btn-secondary">Secondary</button>
                <button type="button" class="mx-1 btn btn-sm btn-success">Success</button>
                <button type="button" class="mx-1 btn btn-sm btn-info">Info</button>  
            </div>
        `;
    }
}

customElements.define('frmdb-look-preview', LookPreviewComponent);
