/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 
import * as _ from 'lodash';
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { KeyEvent } from '@fe/key-event';
import { SimpleAddHocQuery, FilterItem } from '@domain/metadata/simple-add-hoc-query';
import { onEvent } from '@fe/delegated-events';
import { elvis } from '@core/elvis';

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
    currentOptionIdx: number;
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

    constructor() {
        super();
        this.frmdbState.currentOptionIdx! = 0;
    }

    input: HTMLInputElement | undefined;
    connectedCallback() {
        if (this.previousElementSibling && this.previousElementSibling.tagName.toLocaleLowerCase() === 'input') {
            this.input = this.previousElementSibling as HTMLInputElement;
            this.input.autocomplete = "off";
            this.input.oninput = _.debounce(() => this.userEnteredAutocompleteTxt(), 500);
            this.input.onkeydown = (event: KeyboardEvent) => {
                if ([KeyEvent.DOM_VK_UP, KeyEvent.DOM_VK_DOWN, KeyEvent.DOM_VK_ENTER, KeyEvent.DOM_VK_RETURN].includes(event.keyCode)) {
                    event.preventDefault();
                    this.manageSelection(event.keyCode);
                }
            }
        }
        onEvent(this.shadowRoot!, 'mouseover', 'tr[data-frmdb-table="options[]"] *', (ev: MouseEvent) => {
            let opt = (ev.target! as Element).closest('tr')!['$DATA-FRMDB-OBJ$'];
            this.frmdbState.options![this.frmdbState.currentOptionIdx!]._isSelected = false;
            elvis(elvis(this.frmdbState.options)[opt._idx])._isSelected = true;
            this.frmdbState.currentOptionIdx! = opt._idx;
        })
        onEvent(this.shadowRoot!, 'click', 'tr[data-frmdb-table="options[]"] *', (ev: MouseEvent) => {
            let opt = (ev.target! as Element).closest('tr')!['$DATA-FRMDB-OBJ$'];
            this.selectOption(opt);
        })
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
                if (this.frmdbState.ref_property_name === ctrl.ref_property_name) {
                    //TODO: add filtered_by complex attribute to allow restricting the search space by other related controls
                    filterModel[ctrl.ref_property_name] = {
                        type: "contains",
                        filter: ctrl.fieldValue,
                        filterType: "text"
                    };
                }
            }

            let rows = await BACKEND_SERVICE().simpleAdHocQuery(this.referencedEntityAlias, {
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
            
            let opts: any[] = [];
            for (let [idx, row] of rows.entries()) {
                let opt: any = {};
                for (let {ref_property_name: fieldName, fieldValue} of this.frmdbState.relatedControls) {
                    opt[fieldName] = this.highlightOption(row[fieldName], fieldValue, fieldName == this.frmdbState.ref_property_name);
                    opt["___" + fieldName] = row[fieldName];
                }
                opt['_relatedControls'] = this.frmdbState.relatedControls;
                opt._isSelected = false;
                opt._idx = idx;
                opts.push(opt);
                this.frmdbState.popupOpened = true;
            }
            this.frmdbState.currentOptionIdx! = 0;
            if (opts.length > 0) opts[this.frmdbState.currentOptionIdx]._isSelected = true;
            this.frmdbState.options = opts;
        }
    }

    private getRelatedControls(): AutocompleteState['relatedControls'] {
        return this.getRelatedAutocompleteControls().map((relatedCtrl: AutocompleteComponent) =>
            ({ref_property_name: relatedCtrl.frmdbState.ref_property_name!, fieldValue: relatedCtrl.input!.value}));
    }
    private getRelatedAutocompleteControls(): AutocompleteComponent[] {
        let form = this.closest('frmdb-form');
        if (!form) return [];
        return Array.from(form.querySelectorAll('frmdb-autocomplete')).filter((relatedCtrl: AutocompleteComponent) => {
            return this.referencedEntityAlias == relatedCtrl.referencedEntityAlias && relatedCtrl.frmdbState.ref_property_name && relatedCtrl.input;
        }) as AutocompleteComponent[];
    }


    highlightOption(optValue: string, txt: string, isCurrent: boolean) {
        return optValue.replace(txt, '<strong>' + (isCurrent ? '<u>' : '') + txt + (isCurrent ? '</u>' : '') + '</strong>');
    }

    notifyRelatedControls(option: {}) {
        for (let ctrl of this.getRelatedAutocompleteControls()) {
            ctrl.input!.value = option["___" + ctrl.frmdbState.ref_property_name!];
        }
    }

    selectOption(option: {}) {
        if (!this.input) return;
        this.frmdbState.popupOpened = false;
        this.notifyRelatedControls(option);
        this.input.focus();
    }
    selectCurrentOption() {
        if (!this.frmdbState.options || this.frmdbState.options.length <= this.frmdbState.currentOptionIdx!) return;
        this.selectOption(this.frmdbState.options[this.frmdbState.currentOptionIdx!]);
    }
    nextSuggestion() {
        if (this.frmdbState.options && this.frmdbState.currentOptionIdx! >= 0 && this.frmdbState.options.length - 1 > this.frmdbState.currentOptionIdx!) {
            this.frmdbState.options[this.frmdbState.currentOptionIdx!]._isSelected = false;
            this.frmdbState.currentOptionIdx!++;
            this.frmdbState.options[this.frmdbState.currentOptionIdx!]._isSelected = true;
        }
    }
    prevSuggestion() {
        if (this.frmdbState.options && this.frmdbState.currentOptionIdx! > 0) {
            this.frmdbState.options[this.frmdbState.currentOptionIdx!]._isSelected = false;
            this.frmdbState.currentOptionIdx!--;
            this.frmdbState.options[this.frmdbState.currentOptionIdx!]._isSelected = true;
        }
    }

    manageSelection(keyCode: number) {
        if (KeyEvent.DOM_VK_UP == keyCode) {
            this.prevSuggestion(); 
        }

        if (KeyEvent.DOM_VK_DOWN == keyCode) {
            this.nextSuggestion();
        }

        if (KeyEvent.DOM_VK_ENTER == keyCode || KeyEvent.DOM_VK_RETURN == keyCode) {
            this.selectCurrentOption();
        }
    }
}
