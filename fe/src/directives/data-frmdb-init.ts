import { scalarFormulaEvaluate } from "@core/scalar_formula_evaluate";
import { $_FRMDB_SCOPE } from "@fe/fe-functions";
import { isHTMLElement } from "@core/html-tools";

const selector = 'input[data-frmdb-init], select[data-frmdb-init], textarea[data-frmdb-init]';
export function setupDataFrmdbInitDirective(rootEl: HTMLElement) {

    for (let el of Array.from(rootEl.querySelectorAll(selector))) {
        apply(el as any);
    }

    // const observer = new MutationObserver((mutationsList, observer) => {
    //     let els: HTMLElement[] = [];
    //     for(let mutation of mutationsList) {
    //         if (mutation.type === 'childList') {
    //             for (let el of Array.from(mutation.addedNodes)) {
    //                 if (isHTMLElement(el) && el.matches(selector)) els.push(el);
    //             }
    //         }
    //         else if (mutation.type === 'attributes') {
    //             let el = mutation.target;
    //             if (isHTMLElement(el) && el.matches(selector)) els.push(el);
    //         }
    //     }
    //     for (let el of els) apply(el as any);
    // });
    // observer.observe(rootEl, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-frmdb-init'] });
}

function apply(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    let initExpr = el.getAttribute('data-frmdb-init');
    if (!initExpr) { console.warn('data-frmdb-init not found on ', el.outerHTML); return; }
    let val = scalarFormulaEvaluate($_FRMDB_SCOPE(el), initExpr);
    el.value = val;
}
