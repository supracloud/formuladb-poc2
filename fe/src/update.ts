import { waitUntil } from "@domain/ts-utils";
import { DATA_BINDING_MONITOR } from "./init";
import { setupDataFrmdbInitDirective } from "./directives/data-frmdb-init";
import { BACKEND_SERVICE } from "./backend.service";

export async function $UPDATEDOM(el: HTMLElement) {
    try {
        await BACKEND_SERVICE().waitSchema();
        await waitUntil(() => DATA_BINDING_MONITOR, 25, 500);
        for (let tableEl of Array.from(el.querySelectorAll('[data-frmdb-table^="$FRMDB."]'))) {
            DATA_BINDING_MONITOR?.updateDOMForTable(tableEl as HTMLElement);
        }
        setupDataFrmdbInitDirective(el);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
(window as any).$UPDATEDOM = $UPDATEDOM;
