
/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy, OnChanges, ChangeDetectorRef, HostBinding, Input
} from '@angular/core';

import { Location } from '@angular/common';
import * as _ from 'lodash';

import { FormEditingService } from '@fe/app/components/form-editing.service';

import { FormComponent as BaseFormComponent } from '@fe/app/components/form.component';
import { FormAutocompleteComponent as FormAutocompleteComponentBase } from '@fe/app/components/form_autocomplete/form_autocomplete.component';
import { FormDataGridComponent as FormDataGridComponentBase } from '@fe/app/components/form_data_grid/form_data_grid.component';
import { FormDatepickerComponent as FormDatepickerComponentBase } from '@fe/app/components/form_datepicker/form_datepicker.component';
import { FormTableComponent as FormTableComponentBase } from '@fe/app/components/form_table/form_table.component';
import { FormTimepickerComponent as FormTimepickerComponentBase } from '@fe/app/components/form_timepicker/form_timepicker.component';
import { HLayoutComponent as FormHorizontalLayoutComponentBase } from '@fe/app/components/h_layout/h_layout.component';
import { FormInputComponent as BaseFormInputComponent } from '@fe/app/components/form_input/form_input.component';
import { FormItemComponent as FormItemComponentBase } from '@fe/app/components/form_item/form_item.component';
import { FormTabsComponent as FormTabsComponentBase } from '@fe/app/components/form_tabs/form_tabs.component';
import { FormTextComponent as BaseFormTextComponent } from '@fe/app/components/form_text/form_text.component';
import { VLayoutComponent as FormVerticalLayoutComponentBase } from '@fe/app/components/v_layout/v_layout.component';
import { TableComponent as BaseTableComponent } from '@fe/app/components/table/table.component';
import { FormChartComponent as BaseFormChartComponent } from '@fe/app/components/form_chart/form_chart.component';
import { FormStateComponent as BaseFormStateComponent } from '@fe/app/components/form_state/form_state.component';
import { CardComponent as BaseCardComponent } from '@fe/app/components/card/card.component';
import { FormEnumComponent as BaseFormEnumComponent } from '@fe/app/components/form_enum/form_enum.component';
import { ListComponent as BaseListComponent } from '@fe/app/components/list/list.component';
import { GalleryComponent as BaseGalleryComponent } from '@fe/app/components/gallery/gallery.component';
import { CalendarComponent as BaseCalendarComponent } from '@fe/app/components/calendar/calendar.component';
import { ImageComponent as BaseImageComponent } from '@fe/app/components/image/image.component';
import { IconComponent as BaseIconComponent } from '@fe/app/components/icon/icon.component';
import { MediaComponent as BaseMediaComponent } from '@fe/app/components/media/media.component';
import { VNavComponent as BaseVNavComponent } from '@fe/app/components/v_nav/v_nav.component';
import { VNavSegmentComponent as BaseVNavSegmentComponent } from '@fe/app/components/v_nav/v_nav_segment.component';
import { HNavComponent as BaseHNavComponent } from '@fe/app/components/h_nav/h_nav.component';
import { TimelineComponent as BaseTimelineComponent } from '@fe/app/components/timeline/timeline.component';
import { DropdownComponent as BaseDropdownComponent } from '@fe/app/components/dropdown/dropdown.component';
import { VFiltersComponent as BaseVFiltersComponent } from '@fe/app/components/v_filters/v_filters.component';
import { HFiltersComponent as BaseHFiltersComponent } from '@fe/app/components/h_filters/h_filters.component';
import { ButtonComponent as BaseButtonComponent } from '@fe/app/components/button/button.component';
import { ButtonGroupComponent as BaseButtonGroupComponent } from '@fe/app/components/button_group/button_group.component';
import { CardContainerComponent as CardContainerComponentBase } from '@fe/app/components/card_prototype/card_container.component';
import { Router, ActivatedRoute } from '@angular/router';
import { TableService } from '@fe/app/effects/table.service';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'frmdb-form',
    templateUrl: '../../components/form.component.html',
    styleUrls: ['../../components/form.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent extends BaseFormComponent implements OnInit, OnDestroy, OnChanges {
    constructor(
        frmdbStreams: FrmdbStreamsService,
        formEditingService: FormEditingService,
        changeDetectorRef: ChangeDetectorRef,
        _location: Location
    ) {
        super(frmdbStreams, formEditingService, changeDetectorRef, _location);
        this.frmdbStreams.form$.subscribe(form => {
            console.warn(form, this.form, this.formData);
        });
        this.frmdbStreams.formData$.subscribe(formData => {
            console.warn(formData, this.form, this.formData);
        });
    }

    ngOnChanges() {
        console.log(this.form, this.formData);
    }

}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_autocomplete',
    templateUrl: '../../components/form_autocomplete/form_autocomplete.component.html',
    styleUrls: [
        '../../components/form_input/form_input.component.scss',
        '../../components/form_autocomplete/form_autocomplete.component.scss',
    ]
})
export class FormAutocompleteComponent extends FormAutocompleteComponentBase implements OnInit, OnDestroy {
    constructor(formEditingService: FormEditingService, i18npipe: I18nPipe) {
        super(formEditingService, i18npipe);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-form_data_grid]',
    templateUrl: '../../components/form_data_grid/form_data_grid.component.html',
    styleUrls: ['../../components/form_data_grid/form_data_grid.component.scss']
})
export class FormDataGridComponent extends FormDataGridComponentBase implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_datepicker',
    templateUrl: '../../components/form_datepicker/form_datepicker.component.html',
    styleUrls: ['../../components/form_input/form_input.component.scss']
})
export class FormDatepickerComponent extends FormDatepickerComponentBase implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-form_table]',
    host: { class: 'col form-group' },
    templateUrl: '../../components/form_table/form_table.component.html',
    styleUrls: ['../../components/form_table/form_table.component.scss']
})
export class FormTableComponent extends FormTableComponentBase implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_timepicker',
    templateUrl: '../../components/form_timepicker/form_timepicker.component.html',
})
export class FormTimepickerComponent extends FormTimepickerComponentBase implements OnInit, OnDestroy {
  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-h_layout',
    templateUrl: '../../components/h_layout/h_layout.component.html',
    styleUrls: ['../../components/h_layout/h_layout.component.scss']
})
export class HLayoutComponent extends FormHorizontalLayoutComponentBase implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_input',
    host: { class: 'col form-group' },
    templateUrl: '../../components/form_input/form_input.component.html',
    styleUrls: ['../../components/form_input/form_input.component.scss']
})
export class FormInputComponent extends BaseFormInputComponent implements OnInit, OnDestroy {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-form_item]',
    templateUrl: '../../components/form_item/form_item.component.html',
    styleUrls: ['../../components/form_item/form_item.component.scss']
})
export class FormItemComponent extends FormItemComponentBase implements OnInit, OnDestroy {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-form_tabs]',
    templateUrl: '../../components/form_tabs/form_tabs.component.html',
    styleUrls: ['../../components/form_tabs/form_tabs.component.scss']
})
export class FormTabsComponent extends FormTabsComponentBase implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_text',
    host: { class: 'col form-group' },
    templateUrl: '../../components/form_text/form_text.component.html',
    styleUrls: ['../../components/form_text/form_text.component.scss']
})
export class FormTextComponent extends BaseFormTextComponent implements OnInit, OnDestroy {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-v_layout',
    templateUrl: '../../components/v_layout/v_layout.component.html',
    styleUrls: ['../../components/v_layout/v_layout.component.scss']
})
export class VLayoutComponent extends FormVerticalLayoutComponentBase implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    selector: 'frmdb-table',
    templateUrl: '../../components/table/table.component.html',
    styleUrls: ['../../components/table/table.component.scss']
})
export class TableComponent extends BaseTableComponent implements OnInit, OnDestroy {
    constructor(
        frmdbStreams: FrmdbStreamsService,
        router: Router,
        route: ActivatedRoute,
        tableService: TableService,
        i18npipe: I18nPipe) {
        super(frmdbStreams, router, route, tableService, i18npipe);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_chart',
    templateUrl: '../../components/form_chart/form_chart.component.html',
    styleUrls: ['../../components/form_chart/form_chart.component.scss']
})
export class FormChartComponent extends BaseFormChartComponent implements OnInit, OnDestroy {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_state',
    templateUrl: '../../components/form_state/form_state.component.html',
    styleUrls: ['../../components/form_state/form_state.component.scss']
})
export class FormStateComponent extends BaseFormStateComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    selector: 'frmdb-card',
    templateUrl: '../../components/card/card.component.html',
    styleUrls: ['../../components/card/card.component.scss']
})
export class CardComponent extends BaseCardComponent implements OnInit {
    constructor(formEditingService: FormEditingService, sanitizer: DomSanitizer) {
        super(formEditingService, sanitizer);
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-form_enum',
    templateUrl: '../../components/form_enum/form_enum.component.html',
    styleUrls: ['../../components/form_enum/form_enum.component.scss']
})
export class FormEnumComponent extends BaseFormEnumComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-list',
    templateUrl: '../../components/list/list.component.html',
    styleUrls: ['../../components/list/list.component.scss']
})
export class ListComponent extends BaseListComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-gallery',
    templateUrl: '../../components/gallery/gallery.component.html',
    styleUrls: ['../../components/gallery/gallery.component.scss']
})
export class GalleryComponent extends BaseGalleryComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-calendar',
    templateUrl: '../../components/calendar/calendar.component.html',
    styleUrls: ['../../components/calendar/calendar.component.scss']
})
export class CalendarComponent extends BaseCalendarComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-image',
    templateUrl: '../../components/image/image.component.html',
    styleUrls: ['../../components/image/image.component.scss']
})
export class ImageComponent extends BaseImageComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-icon',
    templateUrl: '../../components/icon/icon.component.html',
    styleUrls: ['../../components/icon/icon.component.scss']
})
export class IconComponent extends BaseIconComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-media',
    templateUrl: '../../components/media/media.component.html',
    styleUrls: ['../../components/media/media.component.scss']
})
export class MediaComponent extends BaseMediaComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-v_nav',
    templateUrl: '../../components/v_nav/v_nav.component.html',
    styleUrls: ['../../components/v_nav/v_nav.component.scss']
})
export class VNavComponent extends BaseVNavComponent implements OnInit {
    constructor(formEditingService: FormEditingService, changeDetectorRef: ChangeDetectorRef) {
        super(formEditingService, changeDetectorRef);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: '[frmdb-v_nav_segment]',
    templateUrl: '../../components/v_nav/v_nav_segment.component.html',
    styleUrls: ['../../components/v_nav/v_nav_segment.component.scss']
})
export class VNavSegmentComponent extends BaseVNavSegmentComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-h_nav',
    templateUrl: '../../components/h_nav/h_nav.component.html',
    styleUrls: ['../../components/h_nav/h_nav.component.scss']
})
export class HNavComponent extends BaseHNavComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-timeline',
    templateUrl: '../../components/timeline/timeline.component.html',
    styleUrls: ['../../components/timeline/timeline.component.scss']
})
export class TimelineComponent extends BaseTimelineComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-dropdown',
    templateUrl: '../../components/dropdown/dropdown.component.html',
    styleUrls: ['../../components/dropdown/dropdown.component.scss']
})
export class DropdownComponent extends BaseDropdownComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-v_filters',
    templateUrl: '../../components/v_filters/v_filters.component.html',
    styleUrls: ['../../components/v_filters/v_filters.component.scss']
})
export class VFiltersComponent extends BaseVFiltersComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-h_filters',
    templateUrl: '../../components/h_filters/h_filters.component.html',
    styleUrls: ['../../components/h_filters/h_filters.component.scss']
})
export class HFiltersComponent extends BaseHFiltersComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    selector: 'frmdb-button',
    templateUrl: '../../components/button/button.component.html',
    styleUrls: ['../../components/button/button.component.scss']
})
export class ButtonComponent extends BaseButtonComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-button_group',
    templateUrl: '../../components/button_group/button_group.component.html',
    styleUrls: ['../../components/button_group/button_group.component.scss']
})
export class ButtonGroupComponent extends BaseButtonGroupComponent implements OnInit {
    constructor(formEditingService: FormEditingService) {
        super(formEditingService);
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'frmdb-card_container',
    templateUrl: '../../components/card_prototype/card_container.component.html',
    styleUrls: ['../../components/card_prototype/card_container.component.scss']
})
export class CardContainerComponent extends CardContainerComponentBase implements OnInit {
    constructor(public formEditingService: FormEditingService, sanitizer: DomSanitizer) {
        super(formEditingService, sanitizer);
    }

    @HostBinding('style')
    get style() { return super.style; }

    @Input()
    set theme(t: { [k: string]: string }) { super.theme = t; }
}
