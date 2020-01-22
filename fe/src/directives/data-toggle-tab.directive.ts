import { getTarget, onEventChildren } from "../delegated-events";

onEventChildren(document, 'click', '[data-toggle="tab"]', (event) => {
    event.preventDefault();

    let tab: HTMLAnchorElement = getTarget(event) as HTMLAnchorElement;
    if (!tab || tab.tagName != 'A') return;
    
    let tabPane = document.querySelector(tab.href.replace(/^.*#/, '#'));
    if (!tabPane || !tabPane.matches('.tab-pane')) return;
    
    for (let pane of Array.from(tabPane.parentElement!.querySelectorAll('.tab-pane'))) {
        pane.classList.remove('active', 'show');
    }
    tabPane.classList.add('active', 'show');
});
