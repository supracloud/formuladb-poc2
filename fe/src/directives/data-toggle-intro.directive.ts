import { DataToggleTooltipDirective } from "./data-toggle-tooltip.directive";
import { waitUntil } from "@domain/ts-utils";

export class DataToggleintroDirective {
    static selector = '[data-toggle="intro"]';

    constructor(private el: HTMLElement) {
        if (!el.matches(DataToggleintroDirective.selector)) { console.info(`element does not have toggle intro directive`, el.attributes); return }
        el.addEventListener('click', () => DataToggleintroDirective.startIntro());
    }

    static async startIntro() {
        let firstStepEl = document.querySelector('[data-frmdb-intro-step="1"]');
        if (!firstStepEl) {console.info("First step of intro not found, quitting..."); return;}
    
        await waitUntil(() => firstStepEl && DataToggleTooltipDirective.getDirectiveFromEl(firstStepEl), 40, 350);
        
        let tooltip = DataToggleTooltipDirective.getDirectiveFromEl(firstStepEl);
        if (tooltip) tooltip.show();
    }
}
