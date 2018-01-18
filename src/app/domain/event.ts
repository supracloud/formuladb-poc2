import { BaseObj } from "./base_obj";
import { DataObj } from "./metadata/data_obj";
import { Entity } from "./metadata/entity";
import { Form } from "./uimetadata/form";
import { Table } from "./uimetadata/table";
import { generateUUID } from "./uuid";

export class MwzEvent extends BaseObj {
    readonly mwzType = 'Event_';
    _id: string;
    type: string;

    constructor() {
        super();
        this._id = generateUUID();
    }
}

export const UserActionEditedFormDataN = "[form] UserActionEditedFormData";
export const UserActionEditedFormN = "[form] UserActionEditedForm";
export const UserActionEditedTableN = "[table] UserActionEditedTable";
export const UserActionEditedEntityN = "[entity] UserActionEditedEntity";
export const UserActionNewEntityN = "[entity] UserActionNewEntity";
export const UserActionDeleteEntityN = "[entity] UserActionDeleteEntity";

export class UserActionEditedFormDataEvent extends MwzEvent {
    readonly type = UserActionEditedFormDataN;
    public notifMsg: string;

    constructor(public obj: DataObj) {
        super();
    }
}

export class UserActionEditedFormEvent extends MwzEvent {
    readonly type = UserActionEditedFormN;
    public notifMsg: string;

    constructor(public form: Form) {
        super();
    }
}


export class UserActionEditedTableEvent extends MwzEvent {
    readonly type = UserActionEditedTableN;
    public notifMsg: string;

    constructor(public table: Table) {
        super();
    }
}

export class UserActionEditedEntity extends MwzEvent {
    readonly type = UserActionEditedEntityN;
    public notifMsg: string;

    constructor(public entity: Entity) {
        super();
    }
}

export class UserActionNewEntity extends MwzEvent {
    readonly type = UserActionNewEntityN;
    public notifMsg: string;

    constructor(public path: string) {
        super();
    }
}

export class UserActionDeleteEntity extends MwzEvent {
    readonly type = UserActionDeleteEntityN;
    public notifMsg: string;

    constructor(public entity: Entity) {
        super();
    }
}

export type MwzEvents = 
    | UserActionEditedFormDataEvent
    | UserActionEditedFormEvent
    | UserActionEditedTableEvent
    | UserActionEditedEntity
    | UserActionNewEntity
    | UserActionDeleteEntity
    ;
