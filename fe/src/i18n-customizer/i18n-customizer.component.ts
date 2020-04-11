import { I18N_UTILS } from "@core/i18n-utils";
import { AllPageOpts, makeUrlPath, parseAllPageUrl } from "@domain/url-utils";
import { registerFrmdbEditorRouterHandler } from "@fe/frmdb-editor/frmdb-editor-router";
import { dataBindStateToElement } from "@fe/frmdb-element-utils";
import { onEventChildren } from "@fe/delegated-events";
import { I18nLang } from "@domain/i18n";

const HTML: string = require('raw-loader!@fe-assets/i18n-customizer/i18n-customizer.component.html').default;

class State {
    languages: {
        flag: string,
        urlPathname: string,
        titleAutoTranslate: string,
        fullLanguage: string,
        canAutoTranslate: boolean,
    }[] = [];
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

        onEventChildren(this, "click", '[data-frmdb-attr="title:languages[].titleAutoTranslate"]', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            let a: HTMLAnchorElement = event.target.closest('[data-frmdb-table="languages[]"]');
            if (!a) { console.error("Link not found for event ", event); return }
            let pgOpts = parseAllPageUrl(a.pathname);

            if (pgOpts.lang != I18N_UTILS.defaultLanguage) {
                let iframe: HTMLIFrameElement | null = document.body.querySelector('iframe#app');
                if (!iframe) { console.error('iframe not found'); return }

                await I18N_UTILS.translateAll(iframe.contentWindow!.document,
                    I18N_UTILS.defaultLanguage,
                    pgOpts.lang as I18nLang,
                    (targetLang: I18nLang, texts: string[]) =>
                        fetch('/formuladb-api/translate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ to: targetLang, texts })
                        }).then(re => re.json())
                );
            }

            a.dispatchEvent(new Event('click', { bubbles: true }));
        });
    }

    updateState(pageOpts: AllPageOpts) {
        let newState = new State();
        const currentLanguage = I18N_UTILS.getLangDesc(localStorage.getItem('editor-lang') || I18N_UTILS.defaultLanguage)!;

        newState.selectedFlag = `flag-icons-4x3-${currentLanguage!.flag}`;
        for (let lang of I18N_UTILS.languages) {
            newState.languages.push({
                flag: `flag-icons-4x3-${lang.flag}`,
                fullLanguage: lang.full,
                canAutoTranslate: lang.lang != I18N_UTILS.defaultLanguage,
                titleAutoTranslate: `Auto translate page to ${lang.full}`,
                urlPathname: makeUrlPath({
                    ...pageOpts,
                    lang: lang.lang,
                }),
            })
        }

        Object.assign(this.state, newState);
    }

    init() {
        this.updateState(parseAllPageUrl(window.location.pathname));
        registerFrmdbEditorRouterHandler("i18n-customizer", (newUrl: URL, oldPageOpts: AllPageOpts, newPageOpts: AllPageOpts) => {
            this.updateState(newPageOpts);
        });
    }

}

customElements.define('frmdb-i18n-customizer', I18nCustomizerComponent);
