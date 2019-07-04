/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

 
import { UserEnteredAutocompleteText, UserChoseAutocompleteOption } from '@fe/frmdb-user-events';
import * as _ from 'lodash';
import { elvis, elvis_a } from '@core/elvis';
import { FrmdbElementBase, FrmdbElementDecorator } from '@be/live-dom-template/frmdb-element';
import { objKeysTyped } from '@domain/ts-utils';

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

export interface AutoCompleteState extends AutocompleteAttrs {
    popupOpened: boolean;
    relatedControls: AutocompleteAttrs[];
}
class AutoCompleteSharedState {
    controls: {[refPropertyName: string]: AutocompleteAttrs} = {};
    options: {}[] = [];
    selectedOption: {} | null;

    constructor(public currentObjId: string, public entityAlias: string, public currentControl: AutocompleteAttrs) {}
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
export class AutocompleteComponent extends FrmdbElementBase<AutocompleteAttrs, AutoCompleteState> {

    private parentObjId: string | undefined;
    public currentSearchTxt: string | null;
    public popupOpened: boolean = false;

    constructor() {
        super();
    }

    private input: HTMLInputElement | null = null;
    connectedCallback() {
        if (this.previousSibling && (this.previousSibling as Element).tagName === 'input') {
            this.input = this.previousSibling as HTMLInputElement;
        }
        //TODO se event handlers
    }

    getControl() {
        let ctrl = this.formgrp.get(this.fullpath);
        if (!this.control) {
            if (ctrl) {
                let validators: ValidatorFn[] = [];
                if (ctrl.validator) validators.push(ctrl.validator);
                validators.push((control: AbstractControl): { [key: string]: any } | null => {
                    if (!this.autoCompleteState) return null;
                    let validSelection = false;
                    for (let opt of this.autoCompleteState.options) {
                        if (opt[this.inputElement.ref_property_name] === control.value) {
                            validSelection = true;
                        }
                    }
                    return validSelection ? null : { "option-not-found": "referenced value must exist" };
                });
                ctrl.setValidators(validators);
                this.parentObjId = elvis(this.formEditingService.getParentObj(ctrl))._id;
            }
            this.control = ctrl;
        }
        return this.control;
    }

    get relatedControls() {
        let ret = Object.values(elvis(elvis(this.autoCompleteState).controls) || {});
        return ret;
    }

    ngOnInit(): void {
        console.debug(this.fullpath, this.nodel);
        this.inputElement = this.nodel as FormAutocomplete;
        this.getControl();

        this.subscriptions.push(this.frmdbStreams.autoCompleteState$.subscribe(async (autoCompleteState) => {
            if (!this.isAutocompleteStateMatching(autoCompleteState)) {
                this.autoCompleteState = null;
                return;
            }
            this.autoCompleteState = autoCompleteState;

            if (autoCompleteState.selectedOption) {
                let ctrl = this.getControl();
                if (!ctrl) console.warn("Control not found for autocomplete ", this.formgrp, this.fullpath);
                else {
                    ctrl.setValue(autoCompleteState.selectedOption[this.inputElement.ref_property_name]);
                }
            }
            this.popupOpened = this.currentSearchTxt != null
                && (autoCompleteState.currentControl.property_name === this.inputElement.property_name);
            console.debug(this.parentObjId, (this.control as any).name, autoCompleteState, this.popupOpened, this.currentSearchTxt);
            if (!this.changeDetectorRef['destroyed']) {
                this.changeDetectorRef.detectChanges();
            }
        }));

        this.subscriptions.push(this.text$.pipe(
            distinctUntilChanged(),
            debounceTime(200),
        ).subscribe(val => {
            if (val.length >= 2 && this.control) {
                this.currentOptionIdx = 0;
                this.currentSearchTxt = val;
                let parentObj = this.formEditingService.getParentObj(this.control);
                if (parentObj && parentObj._id) {
                    this.frmdbStreams.action(new UserEnteredAutocompleteText(parentObj._id, val, this.inputElement));
                }
            }
        }));
    }

    highlightOption(option: {}) {
        return option[this.inputElement.ref_property_name].replace(this.currentSearchTxt + '', '<strong>' + this.currentSearchTxt + '</strong>');
    }

    isAutocompleteStateMatching(autoCompleteState: AutoCompleteState): boolean {
        if (!this.control) return false;
        if (!this.parentObjId || this.parentObjId !== autoCompleteState.currentObjId
            || (this.inputElement.ref_entity_alias || this.inputElement.ref_entity_name) !== autoCompleteState.entityAlias) return false;
        return true;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    getOptionValue(row): string {
        if (!this.autoCompleteState) return '';
        let valueForCurrentControl = row[this.inputElement.ref_property_name];
        let relatedControlsValues: string[] = [];
        for (let relatedControl of Object.values(this.autoCompleteState.controls)) {
            if (relatedControl.property_name === this.inputElement.property_name) continue;
            relatedControlsValues.push(this.i18npipe.transform(relatedControl.property_name) + ': '
                + row[relatedControl.property_name]);
        }

        return valueForCurrentControl + " (" + relatedControlsValues.join(", ") + ")";
    }

    @ViewChild("input") inputField: ElementRef;
    selectOption(option: {}) {
        this.popupOpened = false;
        this.currentSearchTxt = null;
        this.frmdbStreams.action(new UserChoseAutocompleteOption(option, this.inputElement));
        this.inputField.nativeElement.focus();
    }
    currentOptionIdx: number = 0;
    selectCurrentOption() {
        if (!this.autoCompleteState || this.autoCompleteState.options.length <= this.currentOptionIdx) return;
        this.selectOption(this.autoCompleteState.options[this.currentOptionIdx]);
    }
    nextSuggestion() {
        if (this.autoCompleteState && this.autoCompleteState.options.length - 1 > this.currentOptionIdx) {
            this.currentOptionIdx++;
        }
    }
    prevSuggestion() {
        if (this.currentOptionIdx > 0) {
            this.currentOptionIdx--;
        }
    }

    manageSelection() {
        //TODO
        // (keydown.enter)="selectCurrentOption()" 
        // (keydown.arrowdown)="nextSuggestion()" 
        // (keydown.arrowup)="prevSuggestion()"    
    }
}
