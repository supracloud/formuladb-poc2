import { scalarFormulaEvaluate } from "@core/scalar_formula_evaluate";
import { $_FRMDB_SCOPE } from "@fe/fe-functions";

export function setupDataFrmdbInitDirective(rootEl: HTMLElement) {

    for (let el of Array.from(rootEl.querySelectorAll('[data-frmdb-init]'))) {
        apply(el as any);
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver((mutationsList, observer) => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //TODO apply directive if necessary
            }
            else if (mutation.type === 'attributes') {
                //TODO apply directive if necessary
            }
        }
    });

    // Start observing the target node for configured mutations
    observer.observe(rootEl, { attributes: true, childList: true, subtree: true });
}

function apply(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    let initExpr = el.getAttribute('data-frmdb-init');
    if (!initExpr) { console.warn('data-frmdb-init not found on ', el.outerHTML); return; }
    let val = scalarFormulaEvaluate($_FRMDB_SCOPE(el), initExpr);
    el.value = val;
}
