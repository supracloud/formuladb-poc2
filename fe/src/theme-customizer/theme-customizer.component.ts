import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { onEvent } from "@fe/delegated-events";
import "./look-preview.component";
import "./theme-preview.component";
import { ThemeRules, translateThemeRulesByReplacingClasses } from "@fe/frmdb-themes";

const HTML: string = require('raw-loader!@fe-assets/theme-customizer/theme-customizer.component.html').default;
// const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/theme-customizer/theme-customizer.component.scss').default;

const FIXME_LIST_REMOTE_FILES = [
    'formuladb-env/css/basic-008cba-eeeeee.css',
    'formuladb-env/css/basic-1a1a1a-ffffff.css',
    'formuladb-env/css/basic-2196F3-ffffff.css',
    'formuladb-env/css/basic-593196-a991d4.css',
    'formuladb-env/css/basic-5e72e4-f4f5f7.css',
    'formuladb-env/css/basic-7795f8-6c757d.css',
    'formuladb-env/css/basic-cb8670-363636.css',
    'formuladb-env/css/basic-d9230f-ffffff.css',
    'formuladb-env/css/basic-eb6864-aaaaaa.css',
    'formuladb-env/css/basic-ffc208-353b41.css',
    'formuladb-env/css/cerulean-008cba-eeeeee.css',
    'formuladb-env/css/cerulean-1a1a1a-ffffff.css',
    'formuladb-env/css/cerulean-2196F3-ffffff.css',
    'formuladb-env/css/cerulean-593196-a991d4.css',
    'formuladb-env/css/cerulean-5e72e4-f4f5f7.css',
    'formuladb-env/css/cerulean-7795f8-6c757d.css',
    'formuladb-env/css/cerulean-cb8670-363636.css',
    'formuladb-env/css/cerulean-d9230f-ffffff.css',
    'formuladb-env/css/cerulean-eb6864-aaaaaa.css',
    'formuladb-env/css/cerulean-ffc208-353b41.css',
    'formuladb-env/css/cosmo-008cba-eeeeee.css',
    'formuladb-env/css/cosmo-1a1a1a-ffffff.css',
    'formuladb-env/css/cosmo-2196F3-ffffff.css',
    'formuladb-env/css/cosmo-593196-a991d4.css',
    'formuladb-env/css/cosmo-5e72e4-f4f5f7.css',
    'formuladb-env/css/cosmo-7795f8-6c757d.css',
    'formuladb-env/css/cosmo-cb8670-363636.css',
    'formuladb-env/css/cosmo-d9230f-ffffff.css',
    'formuladb-env/css/cosmo-eb6864-aaaaaa.css',
    'formuladb-env/css/cosmo-ffc208-353b41.css',
    'formuladb-env/css/darkly-008cba-eeeeee.css',
    'formuladb-env/css/darkly-1a1a1a-ffffff.css',
    'formuladb-env/css/darkly-2196F3-ffffff.css',
    'formuladb-env/css/darkly-593196-a991d4.css',
    'formuladb-env/css/darkly-5e72e4-f4f5f7.css',
    'formuladb-env/css/darkly-7795f8-6c757d.css',
    'formuladb-env/css/darkly-cb8670-363636.css',
    'formuladb-env/css/darkly-d9230f-ffffff.css',
    'formuladb-env/css/darkly-eb6864-aaaaaa.css',
    'formuladb-env/css/darkly-ffc208-353b41.css',
    'formuladb-env/css/flatly-008cba-eeeeee.css',
    'formuladb-env/css/flatly-1a1a1a-ffffff.css',
    'formuladb-env/css/flatly-2196F3-ffffff.css',
    'formuladb-env/css/flatly-593196-a991d4.css',
    'formuladb-env/css/flatly-5e72e4-f4f5f7.css',
    'formuladb-env/css/flatly-7795f8-6c757d.css',
    'formuladb-env/css/flatly-cb8670-363636.css',
    'formuladb-env/css/flatly-d9230f-ffffff.css',
    'formuladb-env/css/flatly-eb6864-aaaaaa.css',
    'formuladb-env/css/flatly-ffc208-353b41.css',
    'formuladb-env/css/journal-008cba-eeeeee.css',
    'formuladb-env/css/journal-1a1a1a-ffffff.css',
    'formuladb-env/css/journal-2196F3-ffffff.css',
    'formuladb-env/css/journal-593196-a991d4.css',
    'formuladb-env/css/journal-5e72e4-f4f5f7.css',
    'formuladb-env/css/journal-7795f8-6c757d.css',
    'formuladb-env/css/journal-cb8670-363636.css',
    'formuladb-env/css/journal-d9230f-ffffff.css',
    'formuladb-env/css/journal-eb6864-aaaaaa.css',
    'formuladb-env/css/journal-ffc208-353b41.css',
    'formuladb-env/css/litera-008cba-eeeeee.css',
    'formuladb-env/css/litera-1a1a1a-ffffff.css',
    'formuladb-env/css/litera-2196F3-ffffff.css',
    'formuladb-env/css/litera-593196-a991d4.css',
    'formuladb-env/css/litera-5e72e4-f4f5f7.css',
    'formuladb-env/css/litera-7795f8-6c757d.css',
    'formuladb-env/css/litera-cb8670-363636.css',
    'formuladb-env/css/litera-d9230f-ffffff.css',
    'formuladb-env/css/litera-eb6864-aaaaaa.css',
    'formuladb-env/css/litera-ffc208-353b41.css',
    'formuladb-env/css/lumen-008cba-eeeeee.css',
    'formuladb-env/css/lumen-1a1a1a-ffffff.css',
    'formuladb-env/css/lumen-2196F3-ffffff.css',
    'formuladb-env/css/lumen-593196-a991d4.css',
    'formuladb-env/css/lumen-5e72e4-f4f5f7.css',
    'formuladb-env/css/lumen-7795f8-6c757d.css',
    'formuladb-env/css/lumen-cb8670-363636.css',
    'formuladb-env/css/lumen-d9230f-ffffff.css',
    'formuladb-env/css/lumen-eb6864-aaaaaa.css',
    'formuladb-env/css/lumen-ffc208-353b41.css',
    'formuladb-env/css/lux-008cba-eeeeee.css',
    'formuladb-env/css/lux-1a1a1a-ffffff.css',
    'formuladb-env/css/lux-2196F3-ffffff.css',
    'formuladb-env/css/lux-593196-a991d4.css',
    'formuladb-env/css/lux-5e72e4-f4f5f7.css',
    'formuladb-env/css/lux-7795f8-6c757d.css',
    'formuladb-env/css/lux-cb8670-363636.css',
    'formuladb-env/css/lux-d9230f-ffffff.css',
    'formuladb-env/css/lux-eb6864-aaaaaa.css',
    'formuladb-env/css/lux-ffc208-353b41.css',
    'formuladb-env/css/materia-008cba-eeeeee.css',
    'formuladb-env/css/materia-1a1a1a-ffffff.css',
    'formuladb-env/css/materia-2196F3-ffffff.css',
    'formuladb-env/css/materia-593196-a991d4.css',
    'formuladb-env/css/materia-5e72e4-f4f5f7.css',
    'formuladb-env/css/materia-7795f8-6c757d.css',
    'formuladb-env/css/materia-cb8670-363636.css',
    'formuladb-env/css/materia-d9230f-ffffff.css',
    'formuladb-env/css/materia-eb6864-aaaaaa.css',
    'formuladb-env/css/materia-ffc208-353b41.css',
    'formuladb-env/css/sketchy-008cba-eeeeee.css',
    'formuladb-env/css/sketchy-1a1a1a-ffffff.css',
    'formuladb-env/css/sketchy-2196F3-ffffff.css',
    'formuladb-env/css/sketchy-593196-a991d4.css',
    'formuladb-env/css/sketchy-5e72e4-f4f5f7.css',
    'formuladb-env/css/sketchy-7795f8-6c757d.css',
    'formuladb-env/css/sketchy-cb8670-363636.css',
    'formuladb-env/css/sketchy-d9230f-ffffff.css',
    'formuladb-env/css/sketchy-eb6864-aaaaaa.css',
    'formuladb-env/css/sketchy-ffc208-353b41.css',
    'formuladb-env/css/superhero-008cba-eeeeee.css',
    'formuladb-env/css/superhero-1a1a1a-ffffff.css',
    'formuladb-env/css/superhero-2196F3-ffffff.css',
    'formuladb-env/css/superhero-593196-a991d4.css',
    'formuladb-env/css/superhero-5e72e4-f4f5f7.css',
    'formuladb-env/css/superhero-7795f8-6c757d.css',
    'formuladb-env/css/superhero-cb8670-363636.css',
    'formuladb-env/css/superhero-d9230f-ffffff.css',
    'formuladb-env/css/superhero-eb6864-aaaaaa.css',
    'formuladb-env/css/superhero-ffc208-353b41.css',
    'formuladb-env/css/yeti-008cba-eeeeee.css',
    'formuladb-env/css/yeti-1a1a1a-ffffff.css',
    'formuladb-env/css/yeti-2196F3-ffffff.css',
    'formuladb-env/css/yeti-593196-a991d4.css',
    'formuladb-env/css/yeti-5e72e4-f4f5f7.css',
    'formuladb-env/css/yeti-7795f8-6c757d.css',
    'formuladb-env/css/yeti-cb8670-363636.css',
    'formuladb-env/css/yeti-d9230f-ffffff.css',
    'formuladb-env/css/yeti-eb6864-aaaaaa.css',
    'formuladb-env/css/yeti-ffc208-353b41.css',
];

class Color {
    attr: string;
    constructor(public primary: string, public secondary: string) {
        this.attr = `${this.primary.replace(/^#/, '')}-${this.secondary.replace(/^#/, '')}`;
    }
}
class State {
    colors: Color[] = [];
    looks: string[] = [];
    themes: string[] = [];
    selectedColor: Color | undefined = undefined;
    selectedLook: string | undefined = undefined;
    selectedTheme: string | undefined = undefined;
}

export class ThemeCustomizerComponent extends HTMLElement {
    state = new State();

    _link: HTMLLinkElement | undefined = undefined;
    set linkElem(l: HTMLLinkElement) {
        this._link = l;
        let m = this.parseCssFileName(this._link.href);
        if (m) {
            let {theme: look, primary, secondary} = m;
            this.state.selectedLook = look;
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
                if (!this.state.looks.find(x => x == theme)) this.state.looks.push(theme);
                if (!this.state.colors.find(x => x.primary == primary && x.secondary == secondary)) {
                    this.state.colors.push(new Color(primary, secondary));
                }
            }
        }
        this.state.themes = ['Comfort', 'GrandFrames'];
        updateDOM(this.state, this);

        onEvent(this, "click", '.dropdown-item[data-frmdb-table="colors[]"], .dropdown-item[data-frmdb-table="colors[]"] *', (event) => {
            let color: Color = event.target.closest('[data-frmdb-table="colors[]"]')['$DATA-FRMDB-OBJ$'];
            if (!color) {console.warn("cannot find color for the menu selection"); return;}
            this.state.selectedColor = color;
            this.updateTheme();
        });

        onEvent(this, "click", '[data-frmdb-table="looks[]"]', (event) => {
            let look: string = event.target['$DATA-FRMDB-OBJ$'];
            if (!look) {console.warn("cannot find look for the menu selection"); return;}
            this.state.selectedLook = look;
            this.updateTheme();
        });

        onEvent(this, "click", '[data-frmdb-theme]', (event) => {
            let theme: string = event.target.getAttribute('data-frmdb-theme');
            if (!theme) {console.warn("cannot find theme for the menu selection"); return;}
            
            return fetch(`/formuladb-env/themes/${theme}.json`)
            .then(async (response) => {
                let themeRules: ThemeRules = await response.json();
                translateThemeRulesByReplacingClasses(this._link?.getRootNode() as Document, themeRules);
            });

        });        
    }

    get cssFile() {
        if (!this.state.selectedColor) {console.warn("cannot find selected color for the current page"); return null;}
        if (!this.state.selectedLook) {console.warn("cannot find selected theme for the current page"); return null;}
        return `/formuladb-env/css/${this.state.selectedLook}-${this.state.selectedColor.primary.replace(/^#/, '')}-${this.state.selectedColor.secondary.replace(/^#/, '')}.css`;
    }

    updateTheme() {
        if (!this._link) {console.warn("cannot find the theme stylesheet for the current page"); return;}
        if (!this.state.selectedColor) {console.warn("cannot find selected color for the current page"); return;}
        if (!this.state.selectedLook) {console.warn("cannot find selected theme for the current page"); return;}
        
        this._link.href = this.cssFile || this._link.href;
        
        updateDOM(this.state, this);
    }
}

window.customElements.define('frmdb-theme-customizer', ThemeCustomizerComponent);
