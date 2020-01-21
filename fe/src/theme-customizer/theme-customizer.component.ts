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
    looks: { name: string, active: boolean }[] = [];
    themes: { name: string, active: boolean }[] = [];
    selectedColor: Color | undefined = undefined;
    selectedLook: string | undefined = undefined;
    selectedTheme: string | undefined = undefined;
    noneThemeIsActive: boolean = true;
}

export class ThemeCustomizerComponent extends HTMLElement {
    state = new State();
    currentThemeRules: ThemeRules | undefined;

    _link: HTMLLinkElement | undefined = undefined;
    set linkElem(l: HTMLLinkElement) {
        this._link = l;
        let m = this.parseCssFileName(this._link.href);
        if (m) {
            let { look, primary, secondary } = m;
            this.state.selectedLook = look;
            this.state.selectedColor = new Color(primary, secondary);
            let activeLook = this.state.looks.find(x => x.name == this.state.selectedLook);
            if (activeLook) activeLook.active = true;
            this.initTheme();
            updateDOM(this.state, this);
        }
    }

    connectedCallback() {
        this.innerHTML = HTML;
        this.init();
    }

    parseCssFileName(cssFileName: string): { look: string, primary: string, secondary: string } | null {
        let m = cssFileName.match(/.*\/(\w+)-([0-9a-f]+)-([0-9a-f]+)\.css$/);
        if (m) return { look: m[1], primary: '#' + m[2], secondary: '#' + m[3] }
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
                let { look, primary, secondary } = m;
                if (!this.state.looks.find(x => x.name == look)) this.state.looks.push({ name: look, active: false });
                if (!this.state.colors.find(x => x.primary == primary && x.secondary == secondary)) {
                    this.state.colors.push(new Color(primary, secondary));
                }
            }
        }
        let activeLook = this.state.looks.find(x => x.name == this.state.selectedLook);
        if (activeLook) activeLook.active = true;

        let themeNames: string[] = await fetch(`/formuladb-api/themes`)
            .then(response => {
                return response.json();
            });
        this.state.themes = themeNames.map(t => ({name: t, active: false}));
        this.initTheme();
        updateDOM(this.state, this);

        onEvent(this, "click", '.dropdown-item[data-frmdb-table="colors[]"], .dropdown-item[data-frmdb-table="colors[]"] *', (event) => {
            let color: Color = event.target.closest('[data-frmdb-table="colors[]"]')['$DATA-FRMDB-OBJ$'];
            if (!color) { console.warn("cannot find color for the menu selection"); return; }
            this.state.selectedColor = color;
            this.updateLook();
        });

        onEvent(this, "click", '[data-frmdb-table="looks[]"]', (event) => {
            let look: {name: string, active: boolean} = event.target['$DATA-FRMDB-OBJ$'];
            if (!look) { console.warn("cannot find look for the menu selection"); return; }

            let activeLook = this.state.looks.find(x => x.active);
            if (activeLook && activeLook.name != look.name) activeLook.active = false;

            this.state.selectedLook = look.name;
            activeLook = this.state.looks.find(x => x.name == look.name);
            if (activeLook) activeLook.active = true;
            this.updateLook();
        });

        onEvent(this, "click", '[data-frmdb-theme]', (event) => {
            let themeName: string = event.target.getAttribute('data-frmdb-theme');
            if (!themeName) { console.warn("cannot find theme for the menu selection"); return; }
            if ('- none -' == themeName) {
                unloadCurrentTheme(this._link?.getRootNode() as Document);
                this.state.selectedTheme = themeName;
                this.state.noneThemeIsActive = true;
                this.state.themes.forEach(t => t.active = false);
            } else if (themeName) {
                this.applyActiveTheme(themeName);
                this.state.noneThemeIsActive = false;
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

    applyActiveTheme(themeName: string) {
        applyTheme(themeName, this._link?.getRootNode() as Document);
        this.state.selectedTheme = themeName;
        let activeTheme = this.state.themes.find(t => t.name == themeName);
        if (activeTheme) activeTheme.active = true;
    }

    initTheme() {
        let doc = this._link?.getRootNode() as Document;
        if (!doc) return;
        let themeName = doc.body.getAttribute('data-frmdb-theme');
        if (themeName) {
            this.applyActiveTheme(themeName);
        }
    }

}

window.customElements.define('frmdb-theme-customizer', ThemeCustomizerComponent);
