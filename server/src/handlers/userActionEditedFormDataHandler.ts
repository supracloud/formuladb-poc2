import * as events from "../../../src/app/common/domain/event";
import { FrmdbStoreAtTransaction } from "../frmdbTransactionalStore";
import { BaseObj } from "../../../src/app/common/domain/base_obj";

export async function userActionEditedFormDataHandler(event: events.UserActionEditedFormDataEvent, store: FrmdbStoreAtTransaction, cache: Map<string, BaseObj>): Promise<events.MwzEvents> {
    try {
        let entity = await store.getEntity(event.obj.type_);

        event.readObjs_.push({id_: entity._id, rev_: entity.rev_});

        //TODO: get entities that depend on this entity

        //TODO: compute dependencies and formulas

        event.updatedIds_.push(event.obj._id);
        return store.forPutForTestingPurposes(event.obj)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                return event;
            })
            .then(event => store.setTransaction(event))
            .catch(err => {console.error(err); return Promise.reject(err)});

    } catch (ex) {
        console.error(ex);
        throw ex;
    }
}
