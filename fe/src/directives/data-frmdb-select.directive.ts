import { onDoc, emit, getTarget } from "../delegated-events";
import { elvis } from "@core/elvis";

onDoc('click', '[data-frmdb-select] .dropdown-item, [data-frmdb-select] .dropdown-item *', (event) => {
    let target = getTarget(event)!.closest('.dropdown-item')!;
    let frmdbSelect = target.closest('[data-frmdb-select]');
    if (!frmdbSelect) { console.warn("select not found for " + target); return; }
    let frmdbSelectValue = frmdbSelect.querySelector('[data-frmdb-select] .dropdown-toggle');
    if (!frmdbSelectValue) { console.warn("select value not found for " + target); return; }
    let valueSelector = frmdbSelect.getAttribute('data-frmdb-select');
    let newValue = valueSelector ? elvis(target.querySelector(valueSelector)).outerHTML || target.innerHTML : target.innerHTML;
    let oldValue = frmdbSelectValue.innerHTML;
    if (oldValue != newValue) {
        frmdbSelectValue.innerHTML = newValue;
        emit(frmdbSelect, { type: "FrmdbSelectChange", oldValue, newValue });
    }
    event.preventDefault();
});
