import { $FRMDB_RECORD_EL, $FRMDB_CLOSEST_ELS } from "@fe/fe-functions";
import { getElemForKey, getElemValue, setValueForElem } from "@core/live-dom-template/dom-node";
import { escapeRegExp } from "lodash";
import { isFormEl } from "@fe/live-dom-template/live-dom-template";

enum SupportedEventsEnum {
    click = "click",
}
export class DataFrmdbChangeDirective {
    static selector = '[data-frmdb-change]';
    constructor(el: HTMLElement) {
        if (!el.matches(DataFrmdbChangeDirective.selector)) { console.info(`element does not need init directive`, el.attributes); return };

        let [eventName, valueKey, targetKey] = el.getAttribute('data-frmdb-change')?.split(':')||[];
        if (!Object.values(SupportedEventsEnum).includes(eventName as any)) { console.error(`unknown event ${eventName} for data-frmdb-change`); return;}
        if (!valueKey || !targetKey) { console.warn(`unknown value ${valueKey} / target ${targetKey} for data-frmdb-change`, el.outerHTML); return;}

        el.addEventListener(eventName, (ev) => {
            let parentRecordEl = $FRMDB_RECORD_EL(el);
            if (!parentRecordEl) {console.warn(); return}
            if (!Object.values(SupportedEventsEnum).includes(eventName as any)) { console.warn(`unknown record for data-frmdb-change`, el.outerHTML); return;}
            if (!valueKey || !targetKey) { console.warn(`unknown value ${valueKey} / target ${targetKey} for data-frmdb-change`, el.outerHTML); return;}
            let valueEls = getElemForKey(parentRecordEl, valueKey);
            let value: string | null = null; 
            if (!valueEls || valueEls.length <= 0) { 
                let suffix = parentRecordEl.hasAttribute('data-frmdb-bind-to-record') ? '{}' : '[]';
                if (valueKey.endsWith('._id')) {
                    let objId = parentRecordEl.getAttribute('data-frmdb-record');
                    let dataBindingWithoutId = valueKey.replace(/\._id$/, '')?.replace(new RegExp(escapeRegExp(suffix)), '')?.replace(/^\$FRMDB\./, '');
                    if (objId?.indexOf(dataBindingWithoutId) === 0) {
                        value = parentRecordEl.getAttribute('data-frmdb-record');
                    }
                }
            } else {
                value = getElemValue(valueEls[0]);
            }
            if (value == null) { console.warn(`null value ${valueKey} for data-frmdb-change`, el.outerHTML); return; };
            for (let targetEl of $FRMDB_CLOSEST_ELS(el, targetKey) || []) {
                setValueForElem(targetEl, value);
                if (isFormEl(targetEl)) {
                    targetEl.dispatchEvent(new Event('change', {bubbles: true}));
                }
            }
        });
    }
}
