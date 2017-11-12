import { BaseObj } from "../base_obj";
import { DataObj } from "./data_obj";

export class MwzEvent extends BaseObj {
    readonly mwzType = 'Event_'
    type: string;

    constructor() {
        super();
        this._id = BaseObj.uuid();
    }
}

export const UserActionEditedFormN = "[form] UserActionEditedForm";

export class UserActionEditedFormDataEvent extends MwzEvent {
    readonly type = UserActionEditedFormN;
    public notifMsg: string;

    constructor(public obj: DataObj) {
        super();
    }
}

export type MwzEvents = 
    | UserActionEditedFormDataEvent
    ;