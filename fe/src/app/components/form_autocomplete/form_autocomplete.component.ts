/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    OnInit, OnDestroy
} from '@angular/core';

import { BaseNodeComponent } from '../base_node';

import { FormAutocomplete } from "@core/domain/uimetadata/form";
import { FormEditingService } from '../form-editing.service';
import { UserEnteredAutocompleteText, UserChoseAutocompleteOption } from '@fe/app/actions/form.user.actions';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';

export class FormAutocompleteComponent extends BaseNodeComponent implements OnInit, OnDestroy {

    inputElement: FormAutocomplete;
    options: string[] = [];
    spotOptions: any[];

    constructor(formEditingService: FormEditingService, private i18npipe: I18nPipe) {
        super(formEditingService);
    }

    ngOnInit(): void {
        this.inputElement = this.nodeElement as FormAutocomplete;

        this.subscriptions.push(this.frmdbStreams.autoCompleteState$.subscribe(async (autoCompleteState) => {
            let relatedAutoCompleteControlsState = autoCompleteState[this.inputElement.refEntityAlias || this.inputElement.refEntityName];
            if (!relatedAutoCompleteControlsState) return;
            this.options = relatedAutoCompleteControlsState.options.map(row => {
                let valueForCurrentControl = row[this.inputElement.refPropertyName];
                let relatedControlsValues: string[] = [];
                for (let relatedControl of Object.values(relatedAutoCompleteControlsState.controls)) {
                    if (relatedControl.propertyName === this.inputElement.propertyName) continue;
                    relatedControlsValues.push(this.i18npipe.transform(relatedControl.propertyName) + ': ' 
                        + row[relatedControl.propertyName]);
                }

                return valueForCurrentControl + " (" + relatedControlsValues.join(", ") + ")"; 
            });

            if (relatedAutoCompleteControlsState.selectedOption) {
                let ctrl = this.topLevelFormGroup.get(this.parentFormPath);
                if (!ctrl) console.warn("Control not found for autocomplete ", this.topLevelFormGroup, this.parentFormPath);
                else {
                    ctrl.reset(relatedAutoCompleteControlsState.selectedOption[this.inputElement.refPropertyName]);
                }
            }
        }));

    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    inputChange(val: string) {
        if (val.length > 2) {
            this.frmdbStreams.action(new UserEnteredAutocompleteText(val, this.inputElement));
        }
    }

    inputLeave(val: string) {
        this.frmdbStreams.action(new UserChoseAutocompleteOption(val, this.inputElement));
    }
}
