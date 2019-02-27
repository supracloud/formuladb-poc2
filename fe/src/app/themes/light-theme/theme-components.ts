
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
import { CardComponent as BaseCardComponent } from "@fe/app/form/card/card.component";
import { FormEnumComponent as BaseFormEnumComponent } from "@fe/app/form/form_enum/form_enum.component";
import { ListComponent as BaseListComponent } from "@fe/app/form/list/list.component";
import { GalleryComponent as BaseGalleryComponent } from "@fe/app/form/gallery/gallery.component";
import { CalendarComponent as BaseCalendarComponent } from "@fe/app/form/calendar/calendar.component";
import { ImageComponent as BaseImageComponent } from "@fe/app/form/image/image.component";
import { IconComponent as BaseIconComponent } from "@fe/app/form/icon/icon.component";
import { MediaComponent as BaseMediaComponent } from "@fe/app/form/media/media.component";
import { VNavComponent as BaseVNavComponent } from "@fe/app/form/v_nav/v_nav.component";
import { HNavComponent as BaseHNavComponent } from "@fe/app/form/h_nav/h_nav.component";
import { TimelineComponent as BaseTimelineComponent } from "@fe/app/form/timeline/timeline.component";
import { DropdownComponent as BaseDropdownComponent } from "@fe/app/form/dropdown/dropdown.component";
import { VFiltersComponent as BaseVFiltersComponent } from "@fe/app/form/v_filters/v_filters.component";
import { HFiltersComponent as BaseHFiltersComponent } from "@fe/app/form/h_filters/h_filters.component";
import { ButtonComponent as BaseButtonComponent } from "@fe/app/form/button/button.component";
import { ButtonGroupComponent as BaseButtonGroupComponent } from "@fe/app/form/button_group/button_group.component";
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
    constructor(public frmdbStreams: FrmdbStreamsService, formEditingService: FormEditingService) {
        super(frmdbStreams, formEditingService);
    }
}

@Component({
  selector: '[frmdb-form_data_grid]',
  templateUrl: '../../form/form_data_grid/form_data_grid.component.html',
  styleUrls: ['../../form/form_data_grid/form_data_grid.component.scss']
})
export class FormDataGridComponent extends FormDataGridComponentBase implements OnInit, OnDestroy {
  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
  selector: 'frmdb-form_datepicker',
  templateUrl: '../../form/form_datepicker/form_datepicker.component.html',
  styleUrls: ['../../form/form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends FormDatepickerComponentBase implements OnInit, OnDestroy {
  constructor(public frmdbStreams: FrmdbStreamsService) {
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
  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
  selector: 'frmdb-form_timepicker',
  templateUrl: '../../form/form_timepicker/form_timepicker.component.html',
})
export class FormTimepickerComponent extends FormTimepickerComponentBase implements OnInit, OnDestroy {
  constructor(public frmdbStreams: FrmdbStreamsService) {
    super(frmdbStreams);
  }
}

@Component({
    selector: 'frmdb-h_layout',
    templateUrl: '../../form/h_layout/h_layout.component.html',
    styleUrls: ['../../form/h_layout/h_layout.component.scss']
})
export class HLayoutComponent extends FormHorizontalLayoutComponentBase implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
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
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_item',
    templateUrl: '../../form/form_item/form_item.component.html',
    styleUrls: ['../../form/form_item/form_item.component.scss']
})
export class FormItemComponent extends FormItemComponentBase implements OnInit, OnDestroy {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: '[frmdb-form_tabs]',
    templateUrl: '../../form/form_tabs/form_tabs.component.html',
    styleUrls: ['../../form/form_tabs/form_tabs.component.scss']
})
export class FormTabsComponent extends FormTabsComponentBase implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
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
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-v_layout',
    templateUrl: '../../form/v_layout/v_layout.component.html',
    styleUrls: ['../../form/v_layout/v_layout.component.scss']
})
export class VLayoutComponent extends FormVerticalLayoutComponentBase implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
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
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-form_state',
    templateUrl: '../../form/form_state/form_state.component.html',
    styleUrls: ['../../form/form_state/form_state.component.scss']
})
export class FormStateComponent extends BaseFormStateComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}

@Component({
    selector: 'frmdb-card',
    templateUrl: '../../form/card/card.component.html',
    styleUrls: ['../../form/card/card.component.scss']
})
export class CardComponent extends BaseCardComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-form_enum',
    templateUrl: '../../form/form_enum/form_enum.component.html',
    styleUrls: ['../../form/form_enum/form_enum.component.scss']
})
export class FormEnumComponent extends BaseFormEnumComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-list',
    templateUrl: '../../form/list/list.component.html',
    styleUrls: ['../../form/list/list.component.scss']
})
export class ListComponent extends BaseListComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-gallery',
    templateUrl: '../../form/gallery/gallery.component.html',
    styleUrls: ['../../form/gallery/gallery.component.scss']
})
export class GalleryComponent extends BaseGalleryComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-calendar',
    templateUrl: '../../form/calendar/calendar.component.html',
    styleUrls: ['../../form/calendar/calendar.component.scss']
})
export class CalendarComponent extends BaseCalendarComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-image',
    templateUrl: '../../form/image/image.component.html',
    styleUrls: ['../../form/image/image.component.scss']
})
export class ImageComponent extends BaseImageComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-icon',
    templateUrl: '../../form/icon/icon.component.html',
    styleUrls: ['../../form/icon/icon.component.scss']
})
export class IconComponent extends BaseIconComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-media',
    templateUrl: '../../form/media/media.component.html',
    styleUrls: ['../../form/media/media.component.scss']
})
export class MediaComponent extends BaseMediaComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-vnav',
    templateUrl: '../../form/v_nav/v_nav.component.html',
    styleUrls: ['../../form/v_nav/v_nav.component.scss']
})
export class VNavComponent extends BaseVNavComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-hnav',
    templateUrl: '../../form/h_nav/h_nav.component.html',
    styleUrls: ['../../form/h_nav/h_nav.component.scss']
})
export class HNavComponent extends BaseHNavComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-timeline',
    templateUrl: '../../form/timeline/timeline.component.html',
    styleUrls: ['../../form/timeline/timeline.component.scss']
})
export class TimelineComponent extends BaseTimelineComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-dropdown',
    templateUrl: '../../form/dropdown/dropdown.component.html',
    styleUrls: ['../../form/dropdown/dropdown.component.scss']
})
export class DropdownComponent extends BaseDropdownComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-vfilters',
    templateUrl: '../../form/v_filters/v_filters.component.html',
    styleUrls: ['../../form/v_filters/v_filters.component.scss']
})
export class VFiltersComponent extends BaseVFiltersComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-hfilters',
    templateUrl: '../../form/h_filters/h_filters.component.html',
    styleUrls: ['../../form/h_filters/h_filters.component.scss']
})
export class HFiltersComponent extends BaseHFiltersComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-button',
    templateUrl: '../../form/button/button.component.html',
    styleUrls: ['../../form/button/button.component.scss']
})
export class ButtonComponent extends BaseButtonComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}


@Component({
    selector: 'frmdb-button_group',
    templateUrl: '../../form/button_group/button_group.component.html',
    styleUrls: ['../../form/button_group/button_group.component.scss']
})
export class ButtonGroupComponent extends BaseButtonGroupComponent implements OnInit {
    constructor(public frmdbStreams: FrmdbStreamsService) {
        super(frmdbStreams);
    }
}
