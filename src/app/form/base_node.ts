import { Input, Type, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { NodeElement, NodeType } from "../domain/uimetadata/form";
import { Entity } from "../domain/metadata/entity";

export class BaseNodeComponent {
    @Input()
    nodeElement: NodeElement;

    @Input()
    topLevelFormGroup: FormGroup;

    @Input()
    parentFormPath: string;
}
