
const HTML: string = require('raw-loader!@fe-assets/theme-customizer/theme-customizer.component.html').default;
const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/theme-customizer/theme-customizer.component.scss').default;


class FrmdbThemeCustomizer extends HTMLElement {
    connectedCallback() {
        fetch('/formuladb-themes/', {
            headers: {
                'accept': 'text/html',
            },
        });
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = /*html*/`
        
        `;
    }
}

window.customElements.define('frmdb-theme-customizer', FrmdbThemeCustomizer);
