export interface ThemeRules {
    [themeRuleSelector: string]: {
        addClasses?: string[];
        addCssVars?: {[varName: string]: string};
        addStyles?: {[varName: string]: string};
        children: ThemeRules;
    }
}

export function translateThemeRulesByReplacingClasses(rootEl: Document | ShadowRoot | HTMLElement, themeRules: ThemeRules, parentSelectorOpt = '') {
    let parentSelector = parentSelectorOpt || '';
    for (let [themeRuleSelector, rule] of (Object.entries(themeRules) as any)) {
        for (let el of (rootEl.querySelectorAll(`${parentSelector} ${themeRuleSelector}`) as any)) {
            if (rule.addClasses) {
                //TODO cleanup any previous theme
                el.classList.add(...rule.addClasses);
            }
            if (rule.addStyles) {
                for (let [styleProp, styleVal] of Object.entries(rule.addStyles)) { 
                    el.style[styleProp] = styleVal;
                }
            }
            if (rule.addCssVars) {
                for (let varToAdd of Object.entries(rule.addCssVars)) { 
                    el.style.setProperty(varToAdd[0], varToAdd[1]);
                }
            }
            if (rule.children) {
                translateThemeRulesByReplacingClasses(rootEl, rule.children, themeRuleSelector);
            }
        }
    }
}


/** @deprecated, keeping it as an example of copy-ing CSS rules from one class to another */
function translateThemeRulesByCopyingCSSStyleRules(themeRules) {
    let themeCssRules = {};
    function addThemeCssRule(selector, cssText) {
        let rule = themeCssRules[selector];
        if (!rule) {
            rule = [];
            themeCssRules[selector] = rule;
        }
        rule.push(cssText);
    }
    /**
        @param {CSSStyleRule} rule
    */
    function processCSSStyleRule(rule) {
        /** @type CSSStyleRule*/
        let cssStyleRule = rule;
        for (let [themeClass, cssClassesToAdd] of Object.entries(themeRules)) {
            for (let cssClass of (cssClassesToAdd as any)) {
                let regex = new RegExp(`\\.${cssClass}(?=[\\s,:]|$)`, 'g');
                if (regex.test(cssStyleRule.selectorText)) {
                    console.log(`COPY CLASS ${cssClass} TO ${themeClass} WITH CSS RULE ${cssStyleRule.selectorText} { ${cssStyleRule.style.cssText} }`);
                    addThemeCssRule(cssStyleRule.selectorText.replace(regex, `.${themeClass}`), cssStyleRule.style.cssText);
                } else if (cssStyleRule.selectorText.indexOf(`.${cssClass}`) >= 0) {
                    console.log(`NOT COPY CLASS ${cssClass} TO ${themeClass} WITH SELECTOR ${cssStyleRule.selectorText}`);
                }
            }
        }
    }

    for (let i = 0; i < document.styleSheets.length; i++) {
        /** @type CSSStyleSheet */
        let styleSheet = document.styleSheets[i];
        console.log("STYLESHEET: " + styleSheet.href);
        for (let rule of (styleSheet as any).cssRules) {
            if (CSSRule.STYLE_RULE == rule.type) {
                processCSSStyleRule(rule);
            } else if (CSSRule.MEDIA_RULE == rule.type) {
                if (window.matchMedia(rule.conditionText).matches) {
                    console.log("COPY MEDIA RULE", rule);
                    for (let r of rule.cssRules) {
                        if (CSSRule.STYLE_RULE == r.type) {
                            processCSSStyleRule(r);
                        }
                    }
                }
            }
        }
    }

    console.warn(themeCssRules);

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = (Object.entries(themeCssRules) as any)
        .map(([selector, stylesTxt]) => `${selector} { ${stylesTxt.join(' ')} }`).join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
}
