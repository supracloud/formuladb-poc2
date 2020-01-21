import * as express from "express";

import * as events from "@domain/event";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";

interface Client {
    id: string;
    eventsToSend: events.MwzEvents[];
    //FIXME add filters and notify clients with only data for the current page, do not replicate the whole DB to all clients
}
const Clients: {[id: string]: Client} = {};

export function addEventToChangesFeed(event: events.MwzEvents) {
    for (let client of Object.values(Clients)) {
        client.eventsToSend.push(event);
    }
}

function checkEventsForClient(clientId: string, resolve, reject) {
    if (Clients[clientId].eventsToSend.length > 0) {
        resolve(Clients[clientId].eventsToSend);
        Clients[clientId].eventsToSend = [];
    } else setTimeout(() => checkEventsForClient(clientId, resolve, reject), 500);
}
export async function logPoll(clientId: string): Promise<events.MwzEvents[]> {
    if (!Clients[clientId]) {
        Clients[clientId] = {
            id: clientId,
            eventsToSend: [],
            //FIXME: add client filters here: lists of object id(s), table names and page numbers, other ??
        };
    }

    return new Promise((resolve, reject) => checkEventsForClient(clientId, resolve, reject));
}

export function setupChangesFeedRoutes(app: express.Express, kvsFactory: KeyValueStoreFactoryI) {
    app.post('/formuladb-api/changes-feed/:clientId', async function (req, res, next) {
        let events = await logPoll(req.params.clientId);
        res.send(events);
    });
}