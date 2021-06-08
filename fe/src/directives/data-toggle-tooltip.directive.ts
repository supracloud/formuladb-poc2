import * as _ from "lodash";
import { HighlightComponent } from "@fe/highlight/highlight.component";
import { getDocumentOf } from "@core/dom-utils";

interface GlobalTooltipEl { doc: Document, highlightEl: HighlightComponent }
const GlobalTooltipElems: GlobalTooltipEl[] = [];

enum TooltipActions {
    next = "next",
    back = "back",
    done = "done",
}
export class DataToggleTooltipDirective {
    static selectorTooltip = '[data-toggle="tooltip"]';
    static selectorPopover = '[data-toggle="popover"]';
    static selectorIntro = '[data-frmdb-intro-step]';
    static selector = [DataToggleTooltipDirective.selectorTooltip, DataToggleTooltipDirective.selectorPopover, DataToggleTooltipDirective.selectorIntro].join(',');
    private tooltipEl: GlobalTooltipEl;

    constructor(private el: HTMLElement) {
        if (!el.matches(DataToggleTooltipDirective.selector)) { console.info(`element does not have tooltip directive`, el.attributes); return }
        let doc = getDocumentOf(el);
        let tooltipEl: GlobalTooltipEl | null = null;
        for (let tEl of GlobalTooltipElems) {
            if (tEl.doc === doc) {
                tooltipEl = tEl;
                break;
            }
        }
        if (!tooltipEl) {
            tooltipEl = {
                doc: doc,
                highlightEl: doc.createElement('frmdb-highlight') as HighlightComponent,
            };
            tooltipEl.highlightEl.useWindowScroll = true;
            tooltipEl.highlightEl.tooltipMinHeight = 100;
            tooltipEl.highlightEl.tooltipMinWidth = 325;
            tooltipEl.highlightEl.margin = 5;
            doc.body.appendChild(tooltipEl.highlightEl);
            GlobalTooltipElems.push(tooltipEl);

            tooltipEl.highlightEl.addEventListener('click', (event) => {
                let evEl = event.target as Element;
                let action = evEl.getAttribute('data-frmdb-action') || evEl.closest('[data-frmdb-action]')?.getAttribute('data-frmdb-action');
                DataToggleTooltipDirective.handleTooltipActions(action as TooltipActions, tooltipEl!.highlightEl);   
            });
        }
        this.tooltipEl = tooltipEl;

        if (el.matches(DataToggleTooltipDirective.selectorTooltip)) {
            if (el.dataset.trigger == 'focus') {
                el.addEventListener('mouseenter', () => this.debouncedShow());
                el.addEventListener('focusout', () => this.debouncedHide());
            } else {
                el.addEventListener('mouseenter', () => this.debouncedShow());
                el.addEventListener('mouseleave', () => this.debouncedHide());
            }
        }
        this.setDirectiveOnEl();
    }
    
    setDirectiveOnEl() {
        (this.el as any).$frmdbTooltipDirective$ = this;
    }
    static getDirectiveFromEl(el: Element): DataToggleTooltipDirective {
        return (el as any).$frmdbTooltipDirective$ as DataToggleTooltipDirective;
    }

    show() {
        if (!this.tooltipEl) return;
        let content = this.el.getAttribute('aria-label') || this.el.getAttribute('title');
        if (!content) return;

        if (this.el.dataset.frmdbTooltipBorder != null) {
            this.tooltipEl.highlightEl.style.borderStyle = "dotted";
            this.tooltipEl.highlightEl.style.borderWidth = "4px";
            this.tooltipEl.highlightEl.classList.add("border", `border-${this.el.dataset.frmdbTooltipBorder}`);
        } else {
            this.tooltipEl.highlightEl.style.border = "0";
            this.tooltipEl.highlightEl.classList.remove("border");
        }

        if (this.el.dataset.frmdbTooltipPageFade != null || this.el.dataset.frmdbIntroStep != null) {
            this.tooltipEl.highlightEl.classList.add('page-fade');
        } else {
            this.tooltipEl.highlightEl.classList.remove('page-fade');
        }

        if (this.el.matches(DataToggleTooltipDirective.selectorTooltip)) {
            this.tooltipEl.highlightEl.innerHTML = this.renderTooltip(content);
            this.tooltipEl.highlightEl.style.pointerEvents = "none";
        } else if (this.el.matches(DataToggleTooltipDirective.selectorIntro)) {
            this.tooltipEl.highlightEl.innerHTML = this.renderIntro(content);
            this.tooltipEl.highlightEl.style.pointerEvents = "auto";
        } else if (this.el.matches(DataToggleTooltipDirective.selectorIntro)) {
            this.tooltipEl.highlightEl.innerHTML = this.renderPopover(content);
            this.tooltipEl.highlightEl.style.pointerEvents = "none";
        }

        this.tooltipEl.highlightEl.highlightEl = this.el;
        if (this.el.dataset.trigger === "focus") this.el.focus();
    }

    hide() {
        if (!this.tooltipEl) return;
        this.tooltipEl.highlightEl.highlightEl = null;
        console.log("hide tooltip", this.tooltipEl, this.el);
    }

    static handleTooltipActions(action: TooltipActions, highlightCmp: HighlightComponent) {
        let stepEl = highlightCmp.highlightEl;
        if (!stepEl) return;
        if (action === TooltipActions.next) {
            if (stepEl.hasAttribute('data-intro-next-page')) {
                if (stepEl.hasAttribute('data-intro-next-page-target')) {
                    window.open(stepEl.getAttribute('data-intro-next-page')!, 
                        stepEl.getAttribute('data-intro-next-page-target')!)
                    DataToggleTooltipDirective.getDirectiveFromEl(stepEl).hide();
                } else {
                    window.location.href = stepEl.getAttribute('data-intro-next-page')!;
                }
            } else {
                let currentStep = parseInt(stepEl.getAttribute('data-frmdb-intro-step') || '0');
                DataToggleTooltipDirective.getDirectiveFromEl(stepEl).hide();
                let nextStepEl = document.querySelector(`[data-frmdb-intro-step="${currentStep + 1}"]`);
                stepEl.scrollIntoView();
                if (nextStepEl) DataToggleTooltipDirective.getDirectiveFromEl(nextStepEl).show();
            }
        } else if (action === TooltipActions.back) {
            let currentStep = parseInt(stepEl.getAttribute('data-frmdb-intro-step') || '0');
            if (currentStep === 1) return;
            DataToggleTooltipDirective.getDirectiveFromEl(stepEl).hide();
            let prevStepEl = document.querySelector(`[data-frmdb-intro-step="${currentStep - 1}"]`);
            stepEl.scrollIntoView();
            if (prevStepEl) DataToggleTooltipDirective.getDirectiveFromEl(prevStepEl).show();
        } else if (action === TooltipActions.done) {
            DataToggleTooltipDirective.getDirectiveFromEl(stepEl).hide();
        }
    }

    private debouncedShow = _.debounce(this.show, 100);
    private debouncedHide = _.debounce(this.hide, 100);

    renderPopover(content: string) {
        return /*html*/`
            <div slot="actions-top">
                <div class="popover show" role="tooltip" style="min-width: 320px;" >
                    <div class="arrow"></div>
                    <div class="popover-body">
                        ${content}
                    </div>
                </div>        
            </div>
        `;
    }

    renderTooltip(content: string) {
        return /*html*/`
            <div slot="actions-top">
                <div class="tooltip position-static show" style="min-width: 20rem;" role="tooltip">
                    <div class="tooltip-inner">${content}</div>
                    <div class="arrow"></div>
                </div>
            </div>
        `;
    }

    renderIntro(content: string) {
        this.tooltipEl.highlightEl.classList.add("border", `border-info`);

        let nextLabel = "Step";
        if (this.el.hasAttribute('data-intro-next-page')) {
            // let nextPageUrl = this.el.getAttribute('data-intro-next-page');
            // let path = nextPageUrl?.replace(/\?.*/, '').replace(/^\/\w+/, '');
            nextLabel = `Page`;
        }
        let currentStep = this.el.getAttribute('data-frmdb-intro-step') || '0';

        return /*html*/`
            <div slot="actions-top">
                <div class="popover position-static show" role="tooltip" style="min-width: 20rem;" >
                    <div class="arrow"></div>
                    <h5 class="popover-header">
                        <span class="badge badge-pill badge-primary border border-white" style="font-size: 15px">${currentStep}</span>
                        <span class="text-dark" style="font-size: 14px">${content}</span>
                    </h5>
                    <div class="popover-body">
                        <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                            <div class="btn-group mr-2" role="group" aria-label="First group">
                                <button data-frmdb-action="done" type="button" class="btn btn-secondary px-2" style="font-size: 12px">Done</button>
                            </div>
                            <div class="btn-group mr-2" role="group" aria-label="Second group">
                                <button data-frmdb-action="back" type="button" class="btn btn-secondary px-2" style="font-size: 12px"><i class="frmdb-i-arrow-right head"></i> Back </button>
                                <button data-frmdb-action="next" type="button" class="btn btn-secondary ml-1 px-2" style="font-size: 12px"> Next ${nextLabel} <i class="frmdb-i-arrow-right"></i></button>
                            </div>
                        </div>
                    </div>
                </div>        
            </div>
        `;
    }
}
