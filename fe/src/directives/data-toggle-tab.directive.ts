import { getTarget, onEventChildren } from "../delegated-events";

onEventChildren(document, 'click', '[data-toggle="tab"]', (event) => {
    event.preventDefault();

    let tab: HTMLAnchorElement = getTarget(event) as HTMLAnchorElement;
    if (!tab || tab.tagName != 'A') return;
    
    let tabPane = document.querySelector(tab.href.replace(/^.*#/, '#'));
    if (!tabPane || !tabPane.matches('.tab-pane')) return;
    
    for (let siblingTab of Array.from(tab.parentElement!.parentElement!.querySelectorAll('.nav-item .nav-link'))) {
        siblingTab.classList.remove('active');
    }
    tab.classList.add('active');
    for (let pane of Array.from(tabPane.parentElement!.querySelectorAll('.tab-pane'))) {
        pane.classList.remove('active', 'show');
    }
    tabPane.classList.add('active', 'show');
});
