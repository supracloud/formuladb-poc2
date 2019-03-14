import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { NodeType } from '@core/domain/uimetadata/form';
import { FormComponent } from '../form.component';
import { GridRowComponent } from '../grid_row/grid_row.component';
import { GridColComponent } from '../grid_col/grid_col.component';
import { FormInputComponent } from '../form_input/form_input.component';
import { FormAutocompleteComponent } from '../form_autocomplete/form_autocomplete.component';
import { FormTabsComponent } from '../form_tabs/form_tabs.component';
import { FormTableComponent } from '../form_table/form_table.component';
import { FormDataGridComponent } from '../form_data_grid/form_data_grid.component';
import { FormChartComponent } from '../form_chart/form_chart.component';
import { FormDatepickerComponent } from '../form_datepicker/form_datepicker.component';
import { FormTimepickerComponent } from '../form_timepicker/form_timepicker.component';
import { FormTextComponent } from '../form_text/form_text.component';
import { FormEnumComponent } from '../form_enum/form_enum.component';
import { FormStateComponent } from '../form_state/form_state.component';
import { CardComponent } from '../card/card.component';
import { JumbotronComponent } from '../jumbotron/jumbotron.component';
import { ListComponent } from '../list/list.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { ImageComponent } from '../image/image.component';
import { IconComponent } from '../icon/icon.component';
import { MediaComponent } from '../media/media.component';
import { VNavComponent } from '../v_nav/v_nav.component';
import { HNavComponent } from '../h_nav/h_nav.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { VFiltersComponent } from '../v_filters/v_filters.component';
import { HFiltersComponent } from '../h_filters/h_filters.component';
import { ButtonComponent } from '../button/button.component';
import { ButtonGroupComponent } from '../button_group/button_group.component';
import { CardContainerComponent } from '../card_prototype/card_container.component';
import { PageItemHostDirective } from './page_item_host.directive';
import { FormEditingService } from '../form-editing.service';


export type PageItemComponents =
    | FormComponent
    | FormInputComponent
    | FormAutocompleteComponent
    | FormTabsComponent
    | FormTableComponent
    | FormDatepickerComponent
    | FormTimepickerComponent
    | FormChartComponent
    | FormTextComponent
    | ButtonComponent
    | ButtonGroupComponent
    | CalendarComponent
    | CardComponent
    | JumbotronComponent
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

@Component({
  selector: '[frmdb-page_item]',
  templateUrl: './page_item.component.html',
  styleUrls: ['./page_item.component.scss']
})
export class PageItemComponent extends BaseNodeComponent implements OnInit, OnChanges {
  @ViewChild(PageItemHostDirective) pageItemHost: PageItemHostDirective;
  initialized = false;

  constructor(public formEditingService: FormEditingService, private componentFactoryResolver: ComponentFactoryResolver) {
    super(formEditingService);
  }

  ngOnInit() {
    this.createComponent();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['nodel']) {
      this.createComponent();
    }
  }

  public createComponent() {
    let componentFactory: ComponentFactory<PageItemComponents>;

    if (!this.nodel) {
      console.warn("Empty node element found", this);
      return;
    }

    switch (this.nodel.nodeType) {
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
        throw new Error("Unknown item type " + JSON.stringify(this.nodel));
    }

    let viewContainerRef = this.pageItemHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<BaseNodeComponent>componentRef.instance).nodel = this.nodel;
    (<BaseNodeComponent>componentRef.instance).formgrp = this.formgrp;
    (<BaseNodeComponent>componentRef.instance).fullpath = this.fullpath;
    (<BaseNodeComponent>componentRef.instance).rdonly = this.rdonly;
  }

}
