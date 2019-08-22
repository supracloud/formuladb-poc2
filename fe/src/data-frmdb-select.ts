import { onDoc, emit } from "./delegated-events";
import { updateDOM } from "./live-dom-template/live-dom-template";

export class FrmdbSelect {

    private _options: string[];
    set options(opts: string[]) {
        this._options = opts;
        this.render();
    }
    get options(): string[] {
        if (!this._options) {
            let optionsFromDOM = this.elem.querySelectorAll('[data-frmdb-value]');
            return Array.from().map(o => o.innerHTML);
        } else return this._options;
    } 

    private _selectedOption: string;
    set selectedOption(opt: string) {
        this._selectedOption = opt;
        this.render();
    }
    get selectedOption() {return this._selectedOption} 

    constructor(protected elem: HTMLElement) {

        onDoc('click', '[data-frmdb-action="select"], [data-frmdb-action="select"] *', (event) => {
            let frmdbSelect = event.target.closest('[data-frmdb-select]');
            if (!frmdbSelect) { console.warn("select not found for " + event.target); return; }
            let [oldValue, newValue] = [this.selectedOption, event.target.innerHTML];
            if (this.selectedOption != newValue) {
                this.selectedOption = newValue;
                emit(frmdbSelect, { type: "FrmdbSelectChange", oldValue, newValue });
            }
            event.preventDefault();
        });
    }

    render() {
        updateDOM({frmdbSelect: this}, this.elem);
    }
}
