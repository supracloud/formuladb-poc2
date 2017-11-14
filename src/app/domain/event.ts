import { BaseObj } from "./base_obj";
import { DataObj } from "./metadata/data_obj";
import { Form } from "./uimetadata/form";
import { Table } from "./uimetadata/table";

export class MwzEvent extends BaseObj {
    readonly mwzType = 'Event_'
    type: string;

    constructor() {
        super();
        this._id = BaseObj.uuid();
    }
}

export const UserActionEditedFormDataN = "[form] UserActionEditedFormData";
export const UserActionEditedFormN = "[form] UserActionEditedForm";
export const UserActionEditedTableN = "[table] UserActionEditedTable";

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

export type MwzEvents = 
    | UserActionEditedFormDataEvent
    | UserActionEditedFormEvent
    | UserActionEditedTableEvent
    ;