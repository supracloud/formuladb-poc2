import { getTarget, onEventChildren } from "../delegated-events";

function show(modal: HTMLElement) {
    modal.classList.add('show', 'd-block');
}
function hide(modal: HTMLElement) {
    modal.classList.remove('show', 'd-block');
}

export function $FMODAL(modal: HTMLElement, action?: 'show' | 'hide' | 'toggle') {
    let dismissBtns: HTMLElement[] = Array.from(modal.querySelectorAll('[data-dismiss="modal"]'));
    for (let b of dismissBtns) {
        if (!b.onclick) b.onclick = () => hide(modal);
    }

    if (!modal.onclick) modal.onclick = (event) => {
        if (event.target === modal) {
            hide(modal)
        }
    }
    
    if (!action || action === "show") {
        show(modal);
    } else if (action === "hide") {
        hide(modal);
    } else if (action === "toggle") {
        if (modal.classList.contains('show')) hide(modal);
        else show(modal);
    }
}
(window as any).$FMODAL = $FMODAL;

onEventChildren(document, 'click', '[data-toggle="modal"]', (event) => {
    event.preventDefault();

    let modalToggle: HTMLAnchorElement = getTarget(event) as HTMLAnchorElement;
    if (!modalToggle || modalToggle.tagName != 'A') return;
    
    let modal: HTMLElement = document.querySelector(modalToggle.href.replace(/^.*#/, '#')) as HTMLElement;
    if (!modal || !modal.matches('.modal')) return;
    
    $FMODAL(modal);
});
