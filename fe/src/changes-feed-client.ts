import * as events from "@domain/event";
import { generateTimestampUUID } from "@domain/uuid";
import { inIframe } from "@core/dom-utils";
import { waitUntil } from "@domain/ts-utils";

const CLIENT_ID = generateTimestampUUID();


const Handlers: { [name: string]: (events: events.MwzEvents[]) => Promise<void> } = {};
(window as any).$FRMDB_CHANGES_FEED_HANDLERS$ = Handlers;

let Stop = false;
export function stopChangesFeedLoop() {
    Stop = true;
}

let AlreadyStarted = false;
export async function changesFeedLoop() {
    if (Stop) return;
    if (AlreadyStarted) return;
    console.warn("changesFeedLoop START", new Date(), document?.defaultView?.location?.href, AlreadyStarted);
    AlreadyStarted = true;

    let response = await fetch(`/formuladb-api/changes-feed/${CLIENT_ID}`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
    });
    console.log("changesFeedLoop response", response.status, response.statusText);

    if (response.status == 502 || response.status == 504) {
        // Status 502 is a connection timeout error,
        // may happen when the connection was pending for too long,
        // and the remote server or a proxy closed it
        // let's reconnect
        await changesFeedLoop();
    } else if (response.status != 200) {
        // An error - let's show it
        console.warn("Changes feed error:", response.statusText);
        // Reconnect in one second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await changesFeedLoop();
    } else {
        // Get and show the message
        let events: events.MwzEvents[] = await response.json();
        await Promise.all(Object.values(Handlers).map(h => h(events)));
        // Call subscribe() again to get the next message
        await new Promise(resolve => setTimeout(resolve, 250));//release the connection for 250ms
        await changesFeedLoop();
    }
}

export function registerChangesFeedHandler(name: string, handler: (events: events.MwzEvents[]) => Promise<void>) {
    Handlers[name] = handler;
}

export async function hookIframeChangesFeedHandlers(iframeWindow: Window) {
    await waitUntil(() => (iframeWindow as any).$FRMDB_CHANGES_FEED_HANDLERS$, 25, 500);
    let iframeHandlers: { [name: string]: (events: events.MwzEvents[]) => Promise<void> } =
        (iframeWindow as any).$FRMDB_CHANGES_FEED_HANDLERS$;
    if (!iframeHandlers) { console.warn('no changes feed handlers for iframe window', iframeWindow); return; }
    for (let handlerName of Object.keys(iframeHandlers)) {
        Handlers['iframe-' + handlerName] = iframeHandlers[handlerName];
    }
}
