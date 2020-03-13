/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj } from "./key_value_obj";
import { DataObj } from "./metadata/data_obj";
import { Entity, EntityProperty } from "./metadata/entity";
import { generateUUID } from "./uuid";
import { PageOpts } from "./url-utils";
import { $PageObjT } from "./metadata/default-metadata";

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

export class ServerEventModifiedFormData extends MwzEvent {
    readonly type_ = "ServerEventModifiedFormData";

    constructor(public obj: DataObj) {
        super();
    }
}

export class ServerEventDeletedFormData extends MwzEvent {
    readonly type_ = "ServerEventDeletedFormData";

    constructor(public obj: DataObj) {
        super();
    }
}

export class ServerEventNewApp extends MwzEvent {
    readonly type_ = "ServerEventNewApp";

    constructor(public tenantName: string, public appName: string, public basedOnApp?: string) {
        super();
    }
}

export class ServerEventNewEntity extends MwzEvent {
    readonly type_ = "ServerEventNewEntity";

    constructor(public path: string) {
        super();
    }
}

export class ServerEventDeleteEntity extends MwzEvent {
    readonly type_ = "ServerEventDeleteEntity";

    constructor(public entityId: string) {
        super();
    }
}

export class ServerEventSetPage extends MwzEvent {
    readonly type_ = "ServerEventSetPage";

    constructor(public pageOpts: PageOpts, public pageObj: $PageObjT, 
        public startPageName: string | '$LANDING-PAGE$' | '$BLOG-POST-PAGE$') 
    {
        super();
    }
}

export class ServerEventDeletePage extends MwzEvent {
    readonly type_ = "ServerEventDeletePage";

    constructor(public deletedPagePath: string) {
        super();
    }
}

export class ServerEventPreviewFormula extends MwzEvent {
    readonly type_ = "ServerEventPreviewFormula";

    constructor(public targetEntity: Entity, public targetPropertyName: string, public currentDataObj: DataObj, public formula: string) {
        super();
    }
}

export class ServerEventSetProperty extends MwzEvent {
    readonly type_ = "ServerEventSetProperty";

    constructor(public targetEntity: Entity, public property: EntityProperty) {
        super();
    }
}

export class ServerEventPutPageHtml extends MwzEvent {
    readonly type_ = "ServerEventPutPageHtml";

    constructor(public pageOpts: PageOpts, public pageHtml: string) {
        super();
    }
}

export class ServerEventPutMediaObject extends MwzEvent {
    readonly type_ = "ServerEventPutMediaObject";

    constructor(public tenantName: string, public appName: string, public fileName: string, public base64Content: string) {
        super();
    }
}

export class ServerEventPutIcon extends MwzEvent {
    readonly type_ = "ServerEventPutIcon";
    savedIconClass?: string;

    constructor(public tenantName: string, public appName: string, public iconId: string) {
        super();
    }
}

export class ServerEventDeleteProperty extends MwzEvent {
    readonly type_ = "ServerEventDeleteProperty";

    constructor(public targetEntity: Entity, public propertyName: string) {
        super();
    }
}

export type MwzEvents = 
    | ServerEventModifiedFormData
    | ServerEventDeletedFormData
    | ServerEventNewEntity
    | ServerEventDeleteEntity
    | ServerEventPreviewFormula
    | ServerEventSetProperty
    | ServerEventDeleteProperty
    | ServerEventPutPageHtml
    | ServerEventPutMediaObject
    | ServerEventPutIcon
    | ServerEventSetPage
    | ServerEventDeletePage
    | ServerEventNewApp
    ;
