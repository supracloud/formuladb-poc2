import * as events from "../../../src/app/domain/event";
import { StorageSnapshotAtTransaction } from "../storage.service";
import { BaseObj } from "../../../src/app/domain/base_obj";

export async function userActionEditedFormDataHandler(event: events.UserActionEditedFormDataEvent, storage: StorageSnapshotAtTransaction, cache: Map<string, BaseObj>): Promise<events.MwzEvents> {
    try {
        let entity = await storage.getEntity(event.obj.mwzType);

        event.readObjs_.push({id_: entity._id, rev_: entity.rev_});

        //TODO: get entities that depend on this entity

        //TODO: compute dependencies and formulas

        event.updatedIds_.push(event.obj._id);
        return storage.forPutForTestingPurposes(event.obj)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                return event;
            })
            .then(event => storage.setTransaction(event))
            .catch(err => {console.error(err); return Promise.reject(err)});

    } catch (ex) {
        console.error(ex);
    }
}
