/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

declare const $: JQueryStatic;

afterAll(() => {
    setTimeout(() => {
        $('.jasmine_html-reporter.jasmine-failure-list')
        .remove()
        .prependTo(document.body);
    }, 500);
});

import './live-dom-app.spec';
