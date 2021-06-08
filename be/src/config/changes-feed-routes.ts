import * as express from "express";

import * as events from "@domain/event";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { KeyValueObjIdType } from "@domain/key_value_obj";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { $Dictionary } from "@domain/metadata/default-metadata";

interface Client {
    id: string;
    eventsToSend: events.MwzEvents[];
    objIdFilter: Set<KeyValueObjIdType>;
    tableNameFilter: Set<string>;
}
const Clients: { [id: string]: Client } = {};

export function addEventToChangesFeed(event: events.MwzEvents) {
    for (let client of Object.values(Clients)) {
        if (event.type_ === "ServerEventModifiedFormData" || event.type_ === "ServerEventDeletedFormData") {
            if (client.objIdFilter.has(event.obj._id)
                || entityNameFromDataObjId(event.obj._id) === $Dictionary._id
            ) {
                client.eventsToSend.push(event);
            }
        }
        else if (event.type_ === "ServerEventNewDataObj") {
            if (client.tableNameFilter.has(entityNameFromDataObjId(event.obj._id))) {
                client.eventsToSend.push(event);
            }
        }
        //adding/changing tables/pages are rare event, we don't filter them
        else if (event.type_ === "ServerEventDeleteEntity" || event.type_ === "ServerEventNewEntity") {
            client.eventsToSend.push(event);
        } else if (event.type_ === "ServerEventSetApp") {
            client.eventsToSend.push(event);
        } else if (event.type_ === "ServerEventSetPage" || event.type_ === "ServerEventDeletePage") {
            client.eventsToSend.push(event);
        }
    }
}

const LONG_POLL_INTERVAL = 1000;
function checkEventsForClient(pollIntervalStart: Date, clientId: string, resolve, reject) {
    if (Clients[clientId].eventsToSend.length > 0) {
        resolve(Clients[clientId].eventsToSend);
        Clients[clientId].eventsToSend = [];
    } else {
        let currentTime = new Date();
        if (currentTime.getTime() - pollIntervalStart.getTime() > LONG_POLL_INTERVAL) {
            resolve([]);
        } else {
            setTimeout(() => checkEventsForClient(pollIntervalStart, clientId, resolve, reject), 150);
        }
    }
}
export async function logPoll(clientId: string, activeObjectIds: KeyValueObjIdType[]): Promise<events.MwzEvents[]> {
    let tableNameFilter: Set<string> = new Set();
    for (let objId of activeObjectIds) {
        tableNameFilter.add(entityNameFromDataObjId(objId));
    }
    if (!Clients[clientId]) {
        Clients[clientId] = {
            id: clientId,
            eventsToSend: [],
            objIdFilter: new Set(activeObjectIds),
            tableNameFilter,
        };
    } else {
        Clients[clientId].objIdFilter = new Set(activeObjectIds);
        Clients[clientId].tableNameFilter = tableNameFilter;
    }

    return new Promise((resolve, reject) => checkEventsForClient(new Date(), clientId, resolve, reject));
}

export function setupChangesFeedRoutes(app: express.Express, kvsFactory: KeyValueStoreFactoryI) {
    app.post('/formuladb-api/changes-feed/:clientId', async function (req, res, next) {
        let monitoredObjectIds = req.body as KeyValueObjIdType[];
        let events = await logPoll(req.params.clientId, monitoredObjectIds);
        res.set('Cache-Control', 'no-cache');
        res.send(events);
    });
}
