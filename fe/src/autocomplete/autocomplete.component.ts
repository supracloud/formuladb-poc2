/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 
import * as _ from 'lodash';
import { elvis, elvis_a } from '@core/elvis';
import { FrmdbElementBase, FrmdbElementDecorator, FrmdbElementBaseWithRxjs } from '@be/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@be/backend.service';
import { KeyEvent } from '@fe/key-event';
import { SimpleAddHocQuery, FilterItem } from '@domain/metadata/simple-add-hoc-query';

const HTML: string = require('raw-loader!@fe-assets/autocomplete/autocomplete.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/autocomplete/autocomplete.component.scss').default;
export interface AutocompleteAttrs {
    ref_entity_name: string;
    ref_property_name: string;
    property_name: string;
    ref_entity_alias: string;
    no_label: string;
    join_reference_entity_name?: string;
    join_referenced_property_name?: string;
    join_reference_entity_name2?: string;
    join_referenced_property_name2?: string;
};

export interface frmdbState extends AutocompleteAttrs {
    parentObjId: string;
    popupOpened: boolean;
    options: {[x: string]: any}[];
    selectedOption: {} | null;
}

@FrmdbElementDecorator({
    tag: 'frmdb-autocomplete',
    observedAttributes: [
        "ref_entity_name",
        "ref_property_name",
        "property_name",
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
export class AutocompleteComponent extends FrmdbElementBase<AutocompleteAttrs, frmdbState> {

    private parentObjId: string | undefined;
    public currentSearchTxt: string | null;
    public popupOpened: boolean = false;

    input: HTMLInputElement | undefined;
    connectedCallback() {
        if (this.previousSibling && (this.previousSibling as Element).tagName === 'input') {
            this.input = this.previousSibling as HTMLInputElement;
            this.input.onchange = _.debounce(() => this.userEnteredAutocompleteTxt(), 200);
            this.input.onkeydown = (event: KeyboardEvent) => this.manageSelection(event.keyCode);
        }
    }

    get referencedEntityAlias() {
        return this.frmdbState.ref_entity_alias || this.frmdbState.ref_entity_name;
    }

    async userEnteredAutocompleteTxt() {
        if (!this.input) return;
        if (!this.referencedEntityAlias || !this.frmdbState.property_name || !this.input) return;

        let val = this.input.value;
        if (val.length >= 2) {
            let currentCtrl = {fieldName: this.frmdbState.property_name, fieldValue: this.input.value};
            let relatedCtrls = this.getRelatedControls().concat(currentCtrl);
            let filterModel: {
                [x: string]: FilterItem;
            } = {};
            for (let ctrl of relatedCtrls) {
                filterModel[ctrl.fieldName] = {
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
                for (let {fieldName, fieldValue} of relatedCtrls) {
                    opt[fieldName] = this.highlightOption(row[fieldName], fieldValue, fieldName == currentCtrl.fieldName);
                }
                opts.push(opt);
            }
            this.setFrmdbPropertyAndUpdateDOM("options", opts);
        }
    }

    getRelatedControls(): {fieldName: string, fieldValue: string}[] {
        let ret: {fieldName: string, fieldValue: string}[] = [];
        let form = this.closest('frmdb-form');
        if (!form) return ret;
        form.querySelectorAll('frmdb-autocomplete').forEach((relatedCtrl: AutocompleteComponent) => {
            if (this.referencedEntityAlias == relatedCtrl.referencedEntityAlias && relatedCtrl.frmdbState.property_name && relatedCtrl.input) {
                ret.push({fieldName: relatedCtrl.frmdbState.property_name, fieldValue: relatedCtrl.input.value});
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
