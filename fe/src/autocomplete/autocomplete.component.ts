/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 
import * as _ from 'lodash';
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { KeyEvent } from '@fe/key-event';
import { SimpleAddHocQuery, FilterItem } from '@domain/metadata/simple-add-hoc-query';

const HTML: string = require('raw-loader!@fe-assets/autocomplete/autocomplete.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/autocomplete/autocomplete.component.scss').default;
export interface AutocompleteAttrs {
    ref_entity_name: string;
    ref_property_name: string;
    ref_entity_alias: string;
    no_label: string;
    join_reference_entity_name?: string;
    join_referenced_property_name?: string;
    join_reference_entity_name2?: string;
    join_referenced_property_name2?: string;
};

interface RelatedControl {
    ref_property_name: string;
    fieldValue: string;
}

export interface AutocompleteState extends AutocompleteAttrs {
    parentObjId: string;
    popupOpened: boolean;
    relatedControls: RelatedControl[];
    options: {[x: string]: any}[];
    selectedOption: {} | null;
}

@FrmdbElementDecorator({
    tag: 'frmdb-autocomplete',
    observedAttributes: [
        "ref_entity_name",
        "ref_property_name",
        "ref_entity_alias",
        "no_label",
        "join_reference_entity_name",
        "join_referenced_property_name",
        "join_reference_entity_name2",
        "join_referenced_property_name2"
    ],
    template: HTML,
    style: CSS,
})
export class AutocompleteComponent extends FrmdbElementBase<AutocompleteAttrs, AutocompleteState> {

    private parentObjId: string | undefined;
    public currentSearchTxt: string | null;
    public popupOpened: boolean = false;

    input: HTMLInputElement | undefined;
    connectedCallback() {
        this.style.display = 'block';
        if (this.previousElementSibling && this.previousElementSibling.tagName.toLocaleLowerCase() === 'input') {
            this.input = this.previousElementSibling as HTMLInputElement;
            this.input.autocomplete = "off";
            this.input.oninput = _.debounce(() => this.userEnteredAutocompleteTxt(), 500);
            this.input.onkeydown = (event: KeyboardEvent) => this.manageSelection(event.keyCode);
        }
    }

    get referencedEntityAlias() {
        return this.frmdbState.ref_entity_alias || this.frmdbState.ref_entity_name;
    }

    async userEnteredAutocompleteTxt() {
        if (!this.input) return;
        if (!this.referencedEntityAlias || !this.frmdbState.ref_property_name || !this.input) return;

        let val = this.input.value;
        this.LOG.debug("userEnteredAutocompleteTxt", val);
        if (val.length >= 2) {
            this.frmdbState.relatedControls = this.getRelatedControls();
            let filterModel: {
                [x: string]: FilterItem;
            } = {};
            for (let ctrl of this.frmdbState.relatedControls) {
                filterModel[ctrl.ref_property_name] = {
                    type: "contains",
                    filter: ctrl.fieldValue,
                    filterType: "text"
                };
            }

            this.currentOptionIdx = 0;
            this.currentSearchTxt = val;
            let rows = await BACKEND_SERVICE.simpleAdHocQuery(this.referencedEntityAlias, {
                startRow: 0,
                endRow: 25,
                rowGroupCols: [],
                valueCols: [],
                pivotCols: [],
                pivotMode: false,
                groupKeys: [],
                filterModel,
                sortModel: [],
            } as SimpleAddHocQuery);
            
            let opts: {}[] = [];
            for (let row of rows) {
                let opt = {};
                for (let {ref_property_name: fieldName, fieldValue} of this.frmdbState.relatedControls) {
                    opt[fieldName] = this.highlightOption(row[fieldName], fieldValue, fieldName == this.frmdbState.ref_property_name);
                }
                opt['_relatedControls'] = this.frmdbState.relatedControls;
                opts.push(opt);
                this.frmdbState.popupOpened = true;
            }
            this.frmdbState.options = opts;
        }
    }

    getRelatedControls(): AutocompleteState['relatedControls'] {
        let ret: AutocompleteState['relatedControls'] = [];
        let form = this.closest('frmdb-form');
        if (!form) return ret;
        form.querySelectorAll('frmdb-autocomplete').forEach((relatedCtrl: AutocompleteComponent) => {
            if (this.referencedEntityAlias == relatedCtrl.referencedEntityAlias && relatedCtrl.frmdbState.ref_property_name && relatedCtrl.input) {
                ret.push({ref_property_name: relatedCtrl.frmdbState.ref_property_name, fieldValue: relatedCtrl.input.value});
            }
        });
        return ret;
    }

    highlightOption(optValue: string, txt: string, isCurrent: boolean) {
        return optValue.replace(txt, '<strong>' + (isCurrent ? '<u>' : '') + txt + (isCurrent ? '</u>' : '') + '</strong>');
    }

    notifyRelatedControls() {
        throw new Error("TODO");
    }

    selectOption(option: {}) {
        if (!this.input) return;
        this.popupOpened = false;
        this.currentSearchTxt = null;
        this.notifyRelatedControls();
        this.input.focus();
    }
    currentOptionIdx: number = 0;
    selectCurrentOption() {
        if (!this.frmdbState.options || this.frmdbState.options.length <= this.currentOptionIdx) return;
        this.selectOption(this.frmdbState.options[this.currentOptionIdx]);
    }
    nextSuggestion() {
        if (this.frmdbState.options && this.frmdbState.options.length - 1 > this.currentOptionIdx) {
            this.currentOptionIdx++;
            this.frmdbState.options[this.currentOptionIdx]._isSelected = true;
        }
    }
    prevSuggestion() {
        if (this.currentOptionIdx > 0) {
            this.currentOptionIdx--;
        }
    }

    manageSelection(keyCode: number) {
        if (KeyEvent.DOM_VK_UP == keyCode) {
            this.prevSuggestion();
        }

        if (KeyEvent.DOM_VK_DOWN == keyCode) {
            this.nextSuggestion();
        }

        if (KeyEvent.DOM_VK_ENTER == keyCode) {
            this.selectCurrentOption();
        }
    }
}
