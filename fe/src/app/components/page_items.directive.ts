import * as _ from 'lodash';
import { Directive, ComponentFactoryResolver, ViewContainerRef, ComponentFactory, Input } from '@angular/core';

import { BaseNodeComponent } from './base_node';
import { NodeType, NodeElement, getChildPath } from '@core/domain/uimetadata/form';
import { elvis } from '@core/elvis';
import { FormComponent } from './form.component';
import { GridRowComponent } from './grid_row/grid_row.component';
import { GridColComponent } from './grid_col/grid_col.component';
import { FormInputComponent } from './form_input/form_input.component';
import { FormAutocompleteComponent } from './form_autocomplete/form_autocomplete.component';
import { FormTabsComponent } from './form_tabs/form_tabs.component';
import { FormTableComponent } from './form_table/form_table.component';
import { FormDataGridComponent } from './form_data_grid/form_data_grid.component';
import { FormChartComponent } from './form_chart/form_chart.component';
import { FormDatepickerComponent } from './form_datepicker/form_datepicker.component';
import { FormTimepickerComponent } from './form_timepicker/form_timepicker.component';
import { FormTextComponent } from './form_text/form_text.component';
import { FormEnumComponent } from './form_enum/form_enum.component';
import { FormStateComponent } from './form_state/form_state.component';
import { CardComponent } from '@swimlane/ngx-charts';
import { JumbotronComponent } from './jumbotron/jumbotron.component';
import { ListComponent } from './list/list.component';
import { GalleryComponent } from './gallery/gallery.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ImageComponent } from './image/image.component';
import { IconComponent } from './icon/icon.component';
import { MediaComponent } from './media/media.component';
import { VNavComponent } from './v_nav/v_nav.component';
import { HNavComponent } from './h_nav/h_nav.component';
import { TimelineComponent } from './timeline/timeline.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { VFiltersComponent } from './v_filters/v_filters.component';
import { HFiltersComponent } from './h_filters/h_filters.component';
import { ButtonComponent } from './button/button.component';
import { ButtonGroupComponent } from './button_group/button_group.component';
import { CardContainerComponent } from './card_prototype/card_container.component';
import { FormGroup } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { DateRangePickerComponent } from './date_range_picker/date_range_picker.component';

export type PageItemComponents =
    | FormComponent
    | FormInputComponent
    | FormAutocompleteComponent
    | FormTabsComponent
    | FormTableComponent
    | FormDatepickerComponent
    | DateRangePickerComponent
    | FormTimepickerComponent
    | FormChartComponent
    | FormTextComponent
    | ButtonComponent
    | ButtonGroupComponent
    | CalendarComponent
    | CardComponent
    | JumbotronComponent
    | HeaderComponent
    | DropdownComponent
    | FormDataGridComponent
    | FormEnumComponent
    | FormStateComponent
    | GalleryComponent
    | HFiltersComponent
    | GridRowComponent
    | HNavComponent
    | IconComponent
    | ImageComponent
    | ListComponent
    | MediaComponent
    | TimelineComponent
    | VFiltersComponent
    | GridColComponent
    | VNavComponent
    | CardContainerComponent
    ;

@Directive({
    selector: '[frmdbPageItems]'
})
export class PageItemsDirective {

    @Input()
    formgrp: FormGroup;

    @Input()
    fullpath: string;

    @Input()
    rdonly: boolean;

    constructor(public viewContainerRef: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) { }


    @Input() set frmdbPageItems(childElements: NodeElement[]) {
        console.debug(this.fullpath, childElements);
        if (null == this.fullpath || null == childElements) return;
        let componentFactory: ComponentFactory<PageItemComponents>;
        let viewContainerRef = this.viewContainerRef;
        viewContainerRef.clear();

        for (let nodel of childElements) {

            if (!nodel) {
                console.warn("Empty node element found", this);
                return;
            }

            switch (elvis(nodel).nodeType) {
                case NodeType.form:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormComponent)
                    break;
                case NodeType.grid_row:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(GridRowComponent)
                    break;
                case NodeType.grid_col:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(GridColComponent)
                    break;
                case NodeType.form_input:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormInputComponent)
                    break;
                case NodeType.form_autocomplete:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormAutocompleteComponent)
                    break;
                case NodeType.form_tabs:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormTabsComponent)
                    break;
                case NodeType.form_table:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormTableComponent)
                    break;
                case NodeType.form_data_grid:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormDataGridComponent)
                    break;
                case NodeType.form_chart:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormChartComponent)
                    break;
                case NodeType.form_datepicker:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormDatepickerComponent)
                    break;
                case NodeType.form_timepicker:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormTimepickerComponent)
                    break;
                case NodeType.date_range_picker:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(DateRangePickerComponent)
                    break;
                case NodeType.form_text:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormTextComponent)
                    break;
                case NodeType.form_enum:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormEnumComponent)
                    break;
                case NodeType.form_state:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(FormStateComponent)
                    break;
                case NodeType.card:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(CardComponent)
                    break;
                case NodeType.jumbotron:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(JumbotronComponent)
                    break;
                case NodeType.header:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(HeaderComponent)
                    break;
                case NodeType.list:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(ListComponent)
                    break;
                case NodeType.gallery:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(GalleryComponent)
                    break;
                case NodeType.calendar:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(CalendarComponent)
                    break;
                case NodeType.image:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(ImageComponent)
                    break;
                case NodeType.icon:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(IconComponent)
                    break;
                case NodeType.media:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(MediaComponent)
                    break;
                case NodeType.v_nav:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(VNavComponent)
                    break;
                case NodeType.h_nav:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(HNavComponent)
                    break;
                case NodeType.timeline:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(TimelineComponent)
                    break;
                case NodeType.dropdown:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(DropdownComponent)
                    break;
                case NodeType.v_filters:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(VFiltersComponent)
                    break;
                case NodeType.h_filters:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(HFiltersComponent)
                    break;
                case NodeType.button:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(ButtonComponent)
                    break;
                case NodeType.button_group:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(ButtonGroupComponent)
                    break;
                case NodeType.card_container:
                    componentFactory = this.componentFactoryResolver.resolveComponentFactory<PageItemComponents>(CardContainerComponent)
                    break;
                default:
                    throw new Error("Unknown item type " + JSON.stringify(nodel));
            }

            let componentRef = viewContainerRef.createComponent(componentFactory);
            (<BaseNodeComponent>componentRef.instance).nodel = nodel;
            (<BaseNodeComponent>componentRef.instance).formgrp = this.formgrp;
            (<BaseNodeComponent>componentRef.instance).fullpath = this.getChildPath(nodel);
            (<BaseNodeComponent>componentRef.instance).rdonly = this.rdonly;
        }
    }

    getChildPath(childEl: NodeElement) {
        let formPath = _.isEmpty(this.fullpath) ? [] : [this.fullpath]
        let childPath: string | null = null;
        childPath = getChildPath(childEl);
        if (childPath) formPath.push(childPath);
        return formPath.join('.');
    }
}
