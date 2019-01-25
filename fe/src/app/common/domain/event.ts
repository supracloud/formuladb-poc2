/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj } from "@storage/domain/key_value_obj";
import { DataObj } from "./metadata/data_obj";
import { Entity } from "./metadata/entity";
import { Form } from "./uimetadata/form";
import { Table } from "./uimetadata/table";
import { generateUUID } from "./uuid";

/**
 * The events sent by the clients become transactions on the back-end
 */
export class MwzEvent implements KeyValueObj {
    _id: string;
    _rev?: string;
    clientId_: string;
    type_: string;
    state_: 'BEGIN' | 'PRECOMMIT' | 'COMMIT' | 'FINALIZED' | 'ABORT';
    reason_?: 'ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED' | 'ABORTED_CONFLICT_RETRIES_EXCEEDED' | 'ABORT_ON_ERROR';
    error_?: string;
    updatedIds_?: string[];
    notifMsg_?: string;

    constructor() {
        this.clientId_ = generateUUID();
        this.state_ = 'BEGIN';
    }
}

export const ServerEventModifiedFormDataN = "[form] ServerEventModifiedFormData";
export const ServerEventModifiedFormN = "[form] ServerEventModifiedForm";
export const ServerEventModifiedTableN = "[table] ServerEventModifiedTable";
export const ServerEventModifiedEntityN = "[entity] ServerEventModifiedEntity";
export const ServerEventNewEntityN = "[entity] ServerEventNewEntity";
export const ServerEventDeleteEntityN = "[entity] ServerEventDeleteEntity";

export class ServerEventModifiedFormDataEvent extends MwzEvent {
    readonly type_ = ServerEventModifiedFormDataN;

    constructor(public obj: DataObj) {
        super();
    }
}

export class ServerEventModifiedFormEvent extends MwzEvent {
    readonly type_ = ServerEventModifiedFormN;

    constructor(public form: Form) {
        super();
    }
}


export class ServerEventModifiedTableEvent extends MwzEvent {
    readonly type_ = ServerEventModifiedTableN;

    constructor(public table: Table) {
        super();
    }
}

export class ServerEventModifiedEntity extends MwzEvent {
    readonly type_ = ServerEventModifiedEntityN;

    constructor(public entity: Entity) {
        super();
    }
}

export class ServerEventNewEntity extends MwzEvent {
    readonly type_ = ServerEventNewEntityN;

    constructor(public path: string) {
        super();
    }
}

export class ServerEventDeleteEntity extends MwzEvent {
    readonly type_ = ServerEventDeleteEntityN;

    constructor(public entityId: string) {
        super();
    }
}

export type MwzEvents = 
    | ServerEventModifiedFormDataEvent
    | ServerEventModifiedFormEvent
    | ServerEventModifiedTableEvent
    | ServerEventModifiedEntity
    | ServerEventNewEntity
    | ServerEventDeleteEntity
    ;
