import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { onEvent } from "@fe/delegated-events";
import "./look-preview.component";
import "./theme-preview.component";
import { ThemeRules, translateThemeRulesByReplacingClasses, unloadThemeRules, applyTheme, unloadCurrentTheme } from "@fe/frmdb-themes";

const HTML: string = require('raw-loader!@fe-assets/theme-customizer/theme-customizer.component.html').default;
// const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/theme-customizer/theme-customizer.component.scss').default;

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
    currentThemeRules: ThemeRules | undefined;

    _link: HTMLLinkElement | undefined = undefined;
    set linkElem(l: HTMLLinkElement) {
        this._link = l;
        let m = this.parseCssFileName(this._link.href);
        if (m) {
            let { theme: look, primary, secondary } = m;
            this.state.selectedLook = look;
            this.state.selectedColor = new Color(primary, secondary);
            this.initTheme();
            updateDOM(this.state, this);
        }
    }

    connectedCallback() {
        this.innerHTML = HTML;
        this.init();
    }

    parseCssFileName(cssFileName: string): { theme: string, primary: string, secondary: string } | null {
        let m = cssFileName.match(/.*\/(\w+)-([0-9a-f]+)-([0-9a-f]+)\.css$/);
        if (m) return { theme: m[1], primary: '#' + m[2], secondary: '#' + m[3] }
        else return null;
    }

    async init() {
        let cssFiles = await fetch(`/formuladb-api/looks`)
            .then(response => {
                return response.json();
            });

        for (let cssFile of cssFiles) {
            let m = this.parseCssFileName(cssFile);
            if (m) {
                let { theme, primary, secondary } = m;
                if (!this.state.looks.find(x => x == theme)) this.state.looks.push(theme);
                if (!this.state.colors.find(x => x.primary == primary && x.secondary == secondary)) {
                    this.state.colors.push(new Color(primary, secondary));
                }
            }
        }
        this.state.themes = await fetch(`/formuladb-api/themes`)
            .then(response => {
                return response.json();
            });
        this.initTheme();
        updateDOM(this.state, this);

        onEvent(this, "click", '.dropdown-item[data-frmdb-table="colors[]"], .dropdown-item[data-frmdb-table="colors[]"] *', (event) => {
            let color: Color = event.target.closest('[data-frmdb-table="colors[]"]')['$DATA-FRMDB-OBJ$'];
            if (!color) { console.warn("cannot find color for the menu selection"); return; }
            this.state.selectedColor = color;
            this.updateLook();
        });

        onEvent(this, "click", '[data-frmdb-table="looks[]"]', (event) => {
            let look: string = event.target['$DATA-FRMDB-OBJ$'];
            if (!look) { console.warn("cannot find look for the menu selection"); return; }
            this.state.selectedLook = look;
            this.updateLook();
        });

        onEvent(this, "click", '[data-frmdb-theme]', (event) => {
            let themeName: string = event.target.getAttribute('data-frmdb-theme');
            if (!themeName) { console.warn("cannot find theme for the menu selection"); return; }
            if ('- none -' == themeName) {
                unloadCurrentTheme(this._link?.getRootNode() as Document);
                this.state.selectedTheme = themeName;
            } else if (themeName) {
                applyTheme(themeName, this._link?.getRootNode() as Document);
                this.state.selectedTheme = themeName;
            }
            updateDOM(this.state, this);
        });
    }

    get cssFile() {
        if (!this.state.selectedColor) { console.warn("cannot find selected color for the current page"); return undefined; }
        if (!this.state.selectedLook) { console.warn("cannot find selected theme for the current page"); return undefined; }
        return `/formuladb-env/css/${this.state.selectedLook}-${this.state.selectedColor.primary.replace(/^#/, '')}-${this.state.selectedColor.secondary.replace(/^#/, '')}.css`;
    }

    updateLook() {
        if (!this._link) { console.warn("cannot find the theme stylesheet for the current page"); return; }
        if (!this.state.selectedColor) { console.warn("cannot find selected color for the current page"); return; }
        if (!this.state.selectedLook) { console.warn("cannot find selected theme for the current page"); return; }

        this._link.href = this.cssFile || this._link.href;

        updateDOM(this.state, this);
    }

    initTheme() {
        let doc = this._link?.getRootNode() as Document;
        if (!doc) return;
        let themeName = doc.body.getAttribute('data-frmdb-theme');
        if (themeName) {
            applyTheme(themeName, this._link?.getRootNode() as Document);
            this.state.selectedTheme = themeName;
        }
    }

}

window.customElements.define('frmdb-theme-customizer', ThemeCustomizerComponent);
