import * as _ from 'lodash';
import { postData, BACKEND_SERVICE } from "./backend.service";
import { CLIENT_ID } from "./client-id";

interface LogEvent {
    time: string,
    msg: string,
}
let events: LogEvent[] = [];

export function centralizedLog(...args) {
    console.log(...args);
    events.push({time: new Date().toISOString(), msg: JSON.stringify(args)});
    debounced_postLogEvents();
}

function postLogEvents() {
    postData(
        `/formuladb-api/${BACKEND_SERVICE().appName}/centralized-logging/add-event`, {
             clientId: CLIENT_ID,
             logEvents: events
        }
    );
    events = [];
}

let debounced_postLogEvents = _.debounce(postLogEvents, 500);
