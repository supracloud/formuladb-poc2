function translateThemeRulesByReplacingClasses(themeRules, parentSelectorOpt) {
    let parentSelector = parentSelectorOpt || '';
    for (let [themeRuleSelector, rule] of Object.entries(themeRules)) {
        for (let el of document.querySelectorAll(`${parentSelector} ${themeRuleSelector}`)) {
            if (rule.addClasses) el.classList.add(...rule.addClasses);
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
                translateThemeRulesByReplacingClasses(rule.children, themeRuleSelector);
            }
        }
    }
}


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
            for (let cssClass of cssClassesToAdd) {
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
        for (let rule of styleSheet.cssRules) {
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
    style.innerHTML = Object.entries(themeCssRules)
        .map(([selector, stylesTxt]) => `${selector} { ${stylesTxt.join(' ')} }`).join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
}


window.addEventListener('DOMContentLoaded', async (event) => {
    let fragments = document.querySelectorAll('[data-frmdb-fragment]');
    console.info("FRAGMENTS:", fragments);
    for (let frg of fragments) {
        let url = frg.getAttribute('data-frmdb-fragment');
        let res = await fetch(url, {
            headers: {
                'accept': 'text/html',
            },
        });
        let html = await res.text();
        let classList = Array.from(frg.classList);
        frg.outerHTML = html;
        let expandedFragmentEl = document.querySelector(`[data-frmdb-fragment="${url}"]`);
        console.info("## Set classes: ", classList, expandedFragmentEl);
        for (let cls of classList) {
            expandedFragmentEl.classList.add(cls);
            console.info("classes: ", expandedFragmentEl, expandedFragmentEl.classList);
        }
    }

    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh')
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    // document.querySelector('.navbar-brand span').innerText = 'Comfort';
    // translateThemeRulesByReplacingClasses(ComfortTheme);
    document.querySelector('.navbar-brand span').innerText = 'Grand Frames';
    translateThemeRulesByReplacingClasses(GrandFramesTheme);
});
