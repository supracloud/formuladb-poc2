import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { onEvent } from "@fe/delegated-events";
import "./theme-preview.component";

const HTML: string = require('raw-loader!@fe-assets/theme-customizer/theme-customizer.component.html').default;
// const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/theme-customizer/theme-customizer.component.scss').default;

const FIXME_LIST_REMOTE_FILES = [
    'formuladb-themes/_css/basic-008cba-eeeeee.css',
    'formuladb-themes/_css/basic-1a1a1a-ffffff.css',
    'formuladb-themes/_css/basic-2196F3-ffffff.css',
    'formuladb-themes/_css/basic-593196-a991d4.css',
    'formuladb-themes/_css/basic-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/basic-7795f8-6c757d.css',
    'formuladb-themes/_css/basic-eb6864-aaaaaa.css',
    'formuladb-themes/_css/cerulean-008cba-eeeeee.css',
    'formuladb-themes/_css/cerulean-1a1a1a-ffffff.css',
    'formuladb-themes/_css/cerulean-2196F3-ffffff.css',
    'formuladb-themes/_css/cerulean-593196-a991d4.css',
    'formuladb-themes/_css/cerulean-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/cerulean-7795f8-6c757d.css',
    'formuladb-themes/_css/cerulean-eb6864-aaaaaa.css',
    'formuladb-themes/_css/cerulean-ffc107-343a40.css',
    'formuladb-themes/_css/cosmo-008cba-eeeeee.css',
    'formuladb-themes/_css/cosmo-1a1a1a-ffffff.css',
    'formuladb-themes/_css/cosmo-2196F3-ffffff.css',
    'formuladb-themes/_css/cosmo-593196-a991d4.css',
    'formuladb-themes/_css/cosmo-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/cosmo-7795f8-6c757d.css',
    'formuladb-themes/_css/cosmo-eb6864-aaaaaa.css',
    'formuladb-themes/_css/cosmo-ffc107-343a40.css',
    'formuladb-themes/_css/lux-008cba-eeeeee.css',
    'formuladb-themes/_css/lux-1a1a1a-ffffff.css',
    'formuladb-themes/_css/lux-2196F3-ffffff.css',
    'formuladb-themes/_css/lux-593196-a991d4.css',
    'formuladb-themes/_css/lux-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/lux-7795f8-6c757d.css',
    'formuladb-themes/_css/lux-eb6864-aaaaaa.css',
    'formuladb-themes/_css/lux-ffc107-343a40.css',
    'formuladb-themes/_css/darkly-008cba-eeeeee.css',
    'formuladb-themes/_css/darkly-1a1a1a-ffffff.css',
    'formuladb-themes/_css/darkly-2196F3-ffffff.css',
    'formuladb-themes/_css/darkly-593196-a991d4.css',
    'formuladb-themes/_css/darkly-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/darkly-7795f8-6c757d.css',
    'formuladb-themes/_css/darkly-eb6864-aaaaaa.css',
    'formuladb-themes/_css/darkly-ffc107-343a40.css',
    'formuladb-themes/_css/sketchy-008cba-eeeeee.css',
    'formuladb-themes/_css/sketchy-1a1a1a-ffffff.css',
    'formuladb-themes/_css/sketchy-2196F3-ffffff.css',
    'formuladb-themes/_css/sketchy-593196-a991d4.css',
    'formuladb-themes/_css/sketchy-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/sketchy-7795f8-6c757d.css',
    'formuladb-themes/_css/sketchy-eb6864-aaaaaa.css',
    'formuladb-themes/_css/sketchy-ffc107-343a40.css',
    'formuladb-themes/_css/flatly-008cba-eeeeee.css',
    'formuladb-themes/_css/flatly-1a1a1a-ffffff.css',
    'formuladb-themes/_css/flatly-2196F3-ffffff.css',
    'formuladb-themes/_css/flatly-593196-a991d4.css',
    'formuladb-themes/_css/flatly-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/flatly-7795f8-6c757d.css',
    'formuladb-themes/_css/flatly-eb6864-aaaaaa.css',
    'formuladb-themes/_css/flatly-ffc107-343a40.css',
    'formuladb-themes/_css/journal-008cba-eeeeee.css',
    'formuladb-themes/_css/journal-1a1a1a-ffffff.css',
    'formuladb-themes/_css/journal-2196F3-ffffff.css',
    'formuladb-themes/_css/journal-593196-a991d4.css',
    'formuladb-themes/_css/journal-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/journal-7795f8-6c757d.css',
    'formuladb-themes/_css/journal-eb6864-aaaaaa.css',
    'formuladb-themes/_css/journal-ffc107-343a40.css',
    'formuladb-themes/_css/litera-008cba-eeeeee.css',
    'formuladb-themes/_css/litera-1a1a1a-ffffff.css',
    'formuladb-themes/_css/litera-2196F3-ffffff.css',
    'formuladb-themes/_css/litera-593196-a991d4.css',
    'formuladb-themes/_css/litera-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/litera-7795f8-6c757d.css',
    'formuladb-themes/_css/litera-eb6864-aaaaaa.css',
    'formuladb-themes/_css/litera-ffc107-343a40.css',
    'formuladb-themes/_css/lumen-008cba-eeeeee.css',
    'formuladb-themes/_css/lumen-1a1a1a-ffffff.css',
    'formuladb-themes/_css/lumen-2196F3-ffffff.css',
    'formuladb-themes/_css/lumen-593196-a991d4.css',
    'formuladb-themes/_css/lumen-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/lumen-7795f8-6c757d.css',
    'formuladb-themes/_css/lumen-eb6864-aaaaaa.css',
    'formuladb-themes/_css/lumen-ffc107-343a40.css',
    'formuladb-themes/_css/materia-008cba-eeeeee.css',
    'formuladb-themes/_css/materia-1a1a1a-ffffff.css',
    'formuladb-themes/_css/materia-2196F3-ffffff.css',
    'formuladb-themes/_css/materia-593196-a991d4.css',
    'formuladb-themes/_css/materia-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/materia-7795f8-6c757d.css',
    'formuladb-themes/_css/materia-eb6864-aaaaaa.css',
    'formuladb-themes/_css/materia-ffc107-343a40.css',
    'formuladb-themes/_css/superhero-008cba-eeeeee.css',
    'formuladb-themes/_css/superhero-1a1a1a-ffffff.css',
    'formuladb-themes/_css/superhero-2196F3-ffffff.css',
    'formuladb-themes/_css/superhero-593196-a991d4.css',
    'formuladb-themes/_css/superhero-5e72e4-f4f5f7.css',
    'formuladb-themes/_css/superhero-7795f8-6c757d.css',
    'formuladb-themes/_css/superhero-eb6864-aaaaaa.css',
    'formuladb-themes/_css/superhero-ffc107-343a40.css',
];

class Color {
    attr: string;
    constructor(public primary: string, public secondary: string) {
        this.attr = `${this.primary.replace(/^#/, '')}-${this.secondary.replace(/^#/, '')}`;
    }
}
class State {
    colors: Color[] = [];
    themes: string[] = [];
    selectedColor: Color | undefined = undefined;
    selectedTheme: string | undefined = undefined;
}

export class ThemeCustomizerComponent extends HTMLElement {
    state = new State();

    _link: HTMLLinkElement | undefined = undefined;
    set linkElem(l: HTMLLinkElement) {
        this._link = l;
        let m = this.parseCssFileName(this._link.href);
        if (m) {
            let {theme, primary, secondary} = m;
            this.state.selectedTheme = theme;
            this.state.selectedColor = new Color(primary, secondary);
            updateDOM(this.state, this);
        }
    }

    connectedCallback() {
        this.innerHTML = HTML;
        this.init();
    }

    parseCssFileName(cssFileName: string): {theme: string, primary: string, secondary: string} | null {
        let m = cssFileName.match(/.*\/(\w+)-([0-9a-f]+)-([0-9a-f]+)\.css$/);
        if (m) return {theme: m[1], primary: '#' + m[2], secondary: '#' + m[3]}
        else return null;
    }

    async init() {
        let cssFiles = FIXME_LIST_REMOTE_FILES;

        for (let cssFile of cssFiles) {
            let m = this.parseCssFileName(cssFile);
            if (m) {
                let {theme, primary, secondary} = m;
                if (!this.state.themes.find(x => x == theme)) this.state.themes.push(theme);
                if (!this.state.colors.find(x => x.primary == primary && x.secondary == secondary)) {
                    this.state.colors.push(new Color(primary, secondary));
                }
            }
        }
        updateDOM(this.state, this);

        onEvent(this, "click", '.dropdown-item[data-frmdb-table="colors[]"], .dropdown-item[data-frmdb-table="colors[]"] *', (event) => {
            let color: Color = event.target.closest('[data-frmdb-table="colors[]"]')['$DATA-FRMDB-OBJ$'];
            if (!color) {console.warn("cannot find color for the menu selection"); return;}
            this.state.selectedColor = color;
            this.updateTheme();
        });

        onEvent(this, "click", '[data-frmdb-table="themes[]"]', (event) => {
            let theme: string = event.target['$DATA-FRMDB-OBJ$'];
            if (!theme) {console.warn("cannot find theme for the menu selection"); return;}
            this.state.selectedTheme = theme;
            this.updateTheme();
        });
    }

    get cssFile() {
        if (!this.state.selectedColor) {console.warn("cannot find selected color for the current page"); return null;}
        if (!this.state.selectedTheme) {console.warn("cannot find selected theme for the current page"); return null;}
        return `/formuladb-themes/_css/${this.state.selectedTheme}-${this.state.selectedColor.primary.replace(/^#/, '')}-${this.state.selectedColor.secondary.replace(/^#/, '')}.css`;
    }

    updateTheme() {
        if (!this._link) {console.warn("cannot find the theme stylesheet for the current page"); return;}
        if (!this.state.selectedColor) {console.warn("cannot find selected color for the current page"); return;}
        if (!this.state.selectedTheme) {console.warn("cannot find selected theme for the current page"); return;}
        
        this._link.href = this.cssFile || this._link.href;
        
        updateDOM(this.state, this);
    }
}

window.customElements.define('frmdb-theme-customizer', ThemeCustomizerComponent);
