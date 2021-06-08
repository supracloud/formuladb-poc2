import { scalarFormulaEvaluate } from "@core/scalar_formula_evaluate";
import { $FRMDB_RECORD } from "@fe/fe-functions";

export class DataFrmdbInitDirective {
    static selector = 'input[data-frmdb-init], select[data-frmdb-init], textarea[data-frmdb-init]';
    constructor(el: HTMLElement) {
        if (!el.matches(DataFrmdbInitDirective.selector)) { console.info(`element does not need init directive`, el.attributes); return };
        let inputEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

        let initExpr = el.getAttribute('data-frmdb-init');
        if (!initExpr) { console.warn('data-frmdb-init not found on ', el.outerHTML); return; }
        let val = scalarFormulaEvaluate($FRMDB_RECORD(el)?.parentObj || {}, initExpr);
        inputEl.value = val;    
    }
}
