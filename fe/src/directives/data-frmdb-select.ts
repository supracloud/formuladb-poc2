import { onDoc, emit } from "../delegated-events";

onDoc('click', '[data-frmdb-action~="select"], [data-frmdb-action~="select"] *', (event) => {
    let frmdbSelect = event.target.closest('[data-frmdb-select]');
    if (!frmdbSelect) { console.warn("select not found for " + event.target); return; }
    let frmdbSelectValue = frmdbSelect.querySelector('[data-frmdb-select-value]');
    if (!frmdbSelectValue) { console.warn("select value not found for " + event.target); return; }
    let [oldValue, newValue] = [frmdbSelectValue.innerHTML, event.target.innerHTML];
    if (oldValue != newValue) {
        frmdbSelectValue.innerHTML = newValue;
        emit(frmdbSelect, { type: "FrmdbSelectChange", oldValue, newValue });
    }
    event.preventDefault();
});
