import { Input, Type, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { NodeElement, NodeType } from "../domain/uimetadata/form";
import { Entity } from "../domain/metadata/entity";


import { FormGridComponent } from "./form-grid.component";
import { FormGridRowComponent } from "./form-grid-row.component";
import { FormGridColComponent } from "./form-grid-col.component";
import { FormInputComponent } from "./form-input.component";
import { FormAutocompleteComponent } from "./form-autocomplete.component";
import { FormTableComponent } from "./form-table.component";
import { FormTabsComponent } from "./form-tabs.component";

export class BaseNodeComponent {
    @Input()
    nodeElement: NodeElement;

    @Input()
    entity: Entity;

    @Input()
    propertyName?: string;

    @Input()
    formGroup: FormGroup;

}
