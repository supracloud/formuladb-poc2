import { I18N_UTILS } from "@core/i18n-utils";
import { PageOpts, makeUrlPath, parsePageUrl } from "@domain/url-utils";
import { registerFrmdbEditorRouterHandler } from "@fe/frmdb-editor/frmdb-editor-router";
import { dataBindStateToElement } from "@fe/frmdb-element-urils";

const HTML: string = require('raw-loader!@fe-assets/i18n-customizer/i18n-customizer.component.html').default;

class State {
    languages: {flag: string, urlPathname: string, fullLanguage: string}[] = [];
    selectedFlag: string = `flag-icon flag-icon-${I18N_UTILS.defaultFlag}`;
}

class I18nCustomizerComponent extends HTMLElement {
    state: State = dataBindStateToElement(this, new State());

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = HTML;
        this.init();
    }

    updateState(pageOpts: PageOpts) {
        let newState = new State();
        const currentLanguage = I18N_UTILS.getLangDesc(localStorage.getItem('editor-lang') || I18N_UTILS.defaultLanguage)!;

        newState.selectedFlag = `flag-icon flag-icon-${currentLanguage!.flag}`;
        for (let lang of I18N_UTILS.languages) {
            newState.languages.push({
                flag: `flag-icon flag-icon-${lang.flag}`,
                fullLanguage: lang.full,
                urlPathname: makeUrlPath({
                    ...pageOpts,
                    lang: lang.lang,
                }),
            })
        }

        Object.assign(this.state, newState);        
    }
    
    init() {
        this.updateState(parsePageUrl(window.location.pathname));
        registerFrmdbEditorRouterHandler("i18n-customizer", (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => {
            this.updateState(newPageOpts);
        });
    }

}

customElements.define('frmdb-i18n-customizer', I18nCustomizerComponent);
