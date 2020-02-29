import "./look-preview.component";
import "./theme-preview.component";
import { _old_ThemeRules, translateThemeRulesByReplacingClasses, __old__unloadThemeRules, applyTheme, unloadCurrentTheme } from "@core/frmdb-themes";
import { dataBindStateToElement } from "@fe/frmdb-element-urils";
import { PageOpts, makeUrlPath, parsePageUrl } from "@domain/url-utils";
import { registerFrmdbEditorRouterHandler } from "@fe/frmdb-editor/frmdb-editor-router";

const HTML: string = require('raw-loader!@fe-assets/theme-customizer/theme-customizer.component.html').default;
// const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/theme-customizer/theme-customizer.component.scss').default;

class Color {
    attr: string;
    constructor(public primary: string, public secondary: string, public urlPathname: string) {
        this.attr = `${this.primary.replace(/^#/, '')}-${this.secondary.replace(/^#/, '')}`;
    }
}
class State {
    colors: Color[] = [];
    looks: { name: string, active: boolean, urlPathname: string }[] = [];
    themes: { name: string, active: boolean, urlPathname: string }[] = [];
    selectedColor: Color | undefined = undefined;
    noneThemeIsActive: boolean = false;
}

export class ThemeCustomizerComponent extends HTMLElement {
    state = dataBindStateToElement(this, new State());

    connectedCallback() {
        setTimeout(() => this.initHtml(), 4000);
    }
    initHtml() {
        this.innerHTML = HTML;
        this.init();
    }

    parseCssFileName(cssFileName: string): { look: string, primary: string, secondary: string } | null {
        let m = cssFileName.match(/.*\/(\w+)-([0-9a-f]+)-([0-9a-f]+)\.css$/);
        if (m) return { look: m[1], primary: '#' + m[2], secondary: '#' + m[3] }
        else return null;
    }

    updateState(pageOpts: PageOpts) {
        let newState = new State();
        for (let cssFile of this.cssFiles) {
            let m = this.parseCssFileName(cssFile);
            if (m) {
                let { look, primary, secondary } = m;
                let urlPathname = makeUrlPath({
                    ...pageOpts,
                    look: look,
                    primaryColor: primary.replace(/^#/, ''),
                    secondaryColor: secondary.replace(/^#/, ''),
                });
                if (!newState.looks.find(x => x.name == look)) {
                    newState.looks.push({ name: look, active: false, urlPathname });
                }
                if (!newState.colors.find(x => x.primary == primary && x.secondary == secondary)) {
                    newState.colors.push(new Color(primary, secondary, urlPathname));
                }
            }
        }
        let activeLook = newState.looks.find(x => x.name == pageOpts.look);
        if (activeLook) activeLook.active = true;
        newState.selectedColor = newState.colors.find(x => x.primary == '#'+pageOpts.primaryColor && x.secondary == '#'+pageOpts.secondaryColor);

        newState.themes = this.themeNames.map(t => ({
            name: t, active: false,
            urlPathname: makeUrlPath({
                ...pageOpts,
                theme: t,
            })
        }));

        Object.assign(this.state, newState);
    }

    cssFiles: string[];
    async fetchCssFiles() {
        return fetch(`/formuladb-api/looks`)
            .then(response => {
                return response.json();
            }).then(x => this.cssFiles = x);
    }

    themeNames: string[];
    async fetchThemeNames() {
        return fetch(`/formuladb-api/themes`)
            .then(response => {
                return response.json();
            }).then(x => this.themeNames = x);
    }
    async init() {
        await this.fetchCssFiles();
        await this.fetchThemeNames();
        this.updateState(parsePageUrl(window.location.pathname));
        registerFrmdbEditorRouterHandler("theme-customizer", (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => {
            this.updateState(newPageOpts);
        });
    }
}

window.customElements.define('frmdb-theme-customizer', ThemeCustomizerComponent);
