import { DataToggleTooltipDirective } from "./data-toggle-tooltip.directive";
import { DataFrmdbInitDirective } from "./data-frmdb-init.directive";
import { DataToggleintroDirective } from "./data-toggle-intro.directive";
import { DataFrmdbChangeDirective } from "./data-frmdb-change.directive";


declare var $: any;

const Directives = {
    [DataToggleTooltipDirective.selector]: DataToggleTooltipDirective,
    [DataFrmdbInitDirective.selector]: DataFrmdbInitDirective,
    [DataToggleintroDirective.selector]: DataToggleintroDirective,
    [DataFrmdbChangeDirective.selector]: DataFrmdbChangeDirective,
};
type DirectiveClass = typeof Directives[keyof typeof Directives];
export function applyDirectiveToElemIfNeeded(el: HTMLElement, forceDirectiveClass?: DirectiveClass) {
    let directiveClasses = forceDirectiveClass ? [forceDirectiveClass] : Object.values(Directives);
    for (let directiveClass of directiveClasses) {
        if (!el.matches(directiveClass.selector)) continue;
        new directiveClass(el);
    }
}

export class DirectivesService {
    tablesCache = {};

    constructor(private rootEl: HTMLElement) {}

    init() {
        for (let selector of Object.keys(Directives)) {
            for (let el of Array.from(this.rootEl.querySelectorAll(selector))) {
                applyDirectiveToElemIfNeeded(el as HTMLElement, Directives[selector]);
            }
        }

        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    let el: HTMLElement = mutation.target as HTMLElement;
                    applyDirectiveToElemIfNeeded(el);
                }
            }
        });
        observer.observe(this.rootEl, { attributes: true, childList: true, subtree: true });
    }

}
