import { DataObj } from "@core/domain/metadata/data_obj";
import { NodeElement } from "@core/domain/uimetadata/form";

export interface UserModifiedFormData {
    type: 'UserModifiedFormData';
    obj: DataObj;
}

export class UserDraggedFormElement {
    type: 'UserDraggedFormElement';
    nodeElement: NodeElement | null;
}

export type UserEvent = 
    | UserModifiedFormData
    | UserDraggedFormElement
;
