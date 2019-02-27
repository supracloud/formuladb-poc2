
/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy
} from '@angular/core';

import { Location } from '@angular/common';
import * as _ from "lodash";

import { FormEditingService } from '@fe/app/form/form-editing.service';
import { FrmdbStreamsService } from '@fe/app/frmdb-streams/frmdb-streams.service';

import { FormComponent as BaseFormComponent } from '@fe/app/form/form.component';
import { FormAutocompleteComponent as FormAutocompleteComponentBase } from '@fe/app/form/form_autocomplete/form_autocomplete.component';
import { FormDataGridComponent as FormDataGridComponentBase } from '@fe/app/form/form_data_grid/form_data_grid.component';
import { FormDatepickerComponent as FormDatepickerComponentBase } from '@fe/app/form/form_datepicker/form_datepicker.component';
import { FormTableComponent as FormTableComponentBase } from '@fe/app/form/form_table/form_table.component';
import { FormTimepickerComponent as FormTimepickerComponentBase } from '@fe/app/form/form_timepicker/form_timepicker.component';
import { HLayoutComponent as FormHorizontalLayoutComponentBase } from '@fe/app/form/h_layout/h_layout.component';
import { FormInputComponent as BaseFormInputComponent } from "@fe/app/form/form_input/form_input.component";
import { FormItemComponent as FormItemComponentBase } from '@fe/app/form/form_item/form_item.component';
import { FormTabsComponent  as FormTabsComponentBase} from '@fe/app/form/form_tabs/form_tabs.component';
import { FormTextComponent as BaseFormTextComponent } from "@fe/app/form/form_text/form_text.component";
import { VLayoutComponent as FormVerticalLayoutComponentBase } from '@fe/app/form/v_layout/v_layout.component';
import { TableComponent  as BaseTableComponent} from '@fe/app/table/table.component';
import { FormChartComponent as BaseFormChartComponent } from "@fe/app/form/form_chart/form_chart.component";
import { FormStateComponent as BaseFormStateComponent } from "@fe/app/form/form_state/form_state.component";
import { Router, ActivatedRoute } from '@angular/router';
import { TableService } from '@fe/app/table/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';


@Component({
    selector: 'frmdb-form',
    templateUrl: '../../form/form.component.html',
    styleUrls: ['../../form/form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent extends BaseFormComponent implements OnInit, OnDestroy {
    constructor(
        frmdbStreams: FrmdbStreamsService,
        formEditingService: FormEditingService,
        _location: Location
    ) {
        super(frmdbStreams, formEditingService, _location);
        this.frmdbStreams.form$.subscribe(form => {
            console.warn(form, this.form, this.formData);
        });
        this.frmdbStreams.formData$.subscribe(formData => {
            console.warn(formData, this.form, this.formData);
        });
    }
}

@Component({
    selector: 'frmdb-form_autocomplete',
    templateUrl: '../../form/form_autocomplete/form_autocomplete.component.html',
    styleUrls: [
        '../../form/form_input/form_input.component.scss',
        '../../form/form_autocomplete/form_autocomplete.component.scss',
    ]
})
export class FormAutocompleteComponent extends FormAutocompleteComponentBase implements OnInit, OnDestroy {
    constructor(protected frmdbStreams: FrmdbStreamsService, formEditingService: FormEditingService) {
        super(frmdbStreams, formEditingService);
    }
}

@Component({
  selector: '[frmdb-form_data_grid]',
  templateUrl: '../../form/form_data_grid/form_data_grid.component.html',
  styleUrls: ['../../form/form_data_grid/form_data_grid.component.scss']
})
export class FormDataGridComponent extends FormDataGridComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
  selector: 'frmdb-form_datepicker',
  templateUrl: '../../form/form_datepicker/form_datepicker.component.html',
  styleUrls: ['../../form/form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends FormDatepickerComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
  selector: '[frmdb-form_table]',
  host: { class: "col form-group" },
  templateUrl: '../../form/form_table/form_table.component.html',
  styleUrls: ['../../form/form_table/form_table.component.scss']
})
export class FormTableComponent extends FormTableComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
  selector: 'frmdb-form_timepicker',
  templateUrl: '../../form/form_timepicker/form_timepicker.component.html',
})
export class FormTimepickerComponent extends FormTimepickerComponentBase implements OnInit, OnDestroy {
  constructor(protected frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
    selector: 'frmdb-h_layout',
    templateUrl: '../../form/h_layout/h_layout.component.html',
    styleUrls: ['../../form/h_layout/h_layout.component.scss']
})
export class HLayoutComponent extends FormHorizontalLayoutComponentBase implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_input',
    host: { class: "col form-group" },
    templateUrl: '../../form/form_input/form_input.component.html',
    styleUrls: ['../../form/form_input/form_input.component.scss']
})
export class FormInputComponent extends BaseFormInputComponent implements OnInit, OnDestroy {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_item',
    templateUrl: '../../form/form_item/form_item.component.html',
    styleUrls: ['../../form/form_item/form_item.component.scss']
})
export class FormItemComponent extends FormItemComponentBase implements OnInit, OnDestroy {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: '[frmdb-form_tabs]',
    templateUrl: '../../form/form_tabs/form_tabs.component.html',
    styleUrls: ['../../form/form_tabs/form_tabs.component.scss']
})
export class FormTabsComponent extends FormTabsComponentBase implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_text',
    host: { class: "col form-group" },
    templateUrl: '../../form/form_text/form_text.component.html',
    styleUrls: ['../../form/form_text/form_text.component.scss']
})
export class FormTextComponent extends BaseFormTextComponent implements OnInit, OnDestroy {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-v_layout',
    templateUrl: '../../form/v_layout/v_layout.component.html',
    styleUrls: ['../../form/v_layout/v_layout.component.scss']
})
export class VLayoutComponent extends FormVerticalLayoutComponentBase implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-table',
    templateUrl: '../../table/table.component.html',
    styleUrls: ['../../table/table.component.scss']
})
export class TableComponent extends BaseTableComponent implements OnInit, OnDestroy {
    constructor(
        frmdbStreams: FrmdbStreamsService,
        router: Router,
        route: ActivatedRoute,
        tableService: TableService,
        i18npipe: I18nPipe) 
    {
        super(frmdbStreams, router, route, tableService, i18npipe);
    }
}

@Component({
    selector: 'frmdb-form_chart',
    templateUrl: '../../form/form_chart/form_chart.component.html',
    styleUrls: ['../../form/form_chart/form_chart.component.scss']
})
export class FormChartComponent extends BaseFormChartComponent implements OnInit, OnDestroy {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_state',
    templateUrl: '../../form/form_state/form_state.component.html',
    styleUrls: ['../../form/form_state/form_state.component.scss']
})
export class FormStateComponent extends BaseFormStateComponent implements OnInit {
    constructor(protected frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}
