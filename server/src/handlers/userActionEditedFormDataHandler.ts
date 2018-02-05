import * as events from "../../../src/app/domain/event";
import { StorageService } from "../storage.service";

export function userActionEditedFormDataHandler(storageService: StorageService, event: events.UserActionEditedFormDataEvent): Promise<events.MwzEvents> {
    return _userActionEditedFormDataHandler(storageService, event);
}

async function _userActionEditedFormDataHandler(storageService: StorageService, event: events.UserActionEditedFormDataEvent): Promise<events.MwzEvents> {
    let keepGoing = false;
    
    do {

        try {
            let entity = await storageService.getEntityForTr(event.obj.mwzType, event._id);

            //TODO: get entities that depend on this entity
            //TODO: get entities that depend on this entity

            //TODO: compute dependencies and formulas

            event.updatedIds_ = [event.obj._id];
            return storageService.forPutForTestingPurposes(event.obj)
                .then(() => {
                    event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                    return event;
                })
                .then(event => storageService.setTransaction(event))
                .catch(err => {console.error(err); return Promise.reject(err)});

        } catch (ex) {
            keepGoing = false;
        }
    } while (keepGoing);
    return Promise.resolve(event);
}
