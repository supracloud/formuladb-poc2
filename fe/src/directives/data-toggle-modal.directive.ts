import { getTarget, onEventChildren } from "../delegated-events";

function show(modal: HTMLElement) {
    modal.classList.add('show', 'd-block');
}
function hide(modal: HTMLElement) {
    modal.classList.remove('show', 'd-block');
}

export function $FRMDB_MODAL(modalEl: HTMLElement | string, action?: 'show' | 'hide' | 'toggle'): HTMLElement {
    let modal: HTMLElement;
    if (typeof modalEl === "string") {
        modal = document.querySelector(modalEl) as HTMLElement;
    } else {
        modal = modalEl;
    }
    if (!modal) throw new Error(`${modalEl} not found`);

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
        modal.dispatchEvent(new CustomEvent("FrmdbModalCloseEvent"));
    } else if (action === "toggle") {
        if (modal.classList.contains('show')) hide(modal);
        else show(modal);
    }

    return modal;
}
(window as any).$FRMDB_MODAL = $FRMDB_MODAL;

onEventChildren(document, 'click', '[data-toggle="modal"]', (event) => {
    event.preventDefault();

    let modalToggle: HTMLAnchorElement = getTarget(event) as HTMLAnchorElement;
    if (!modalToggle || modalToggle.tagName != 'A') return;
    
    let modal: HTMLElement = document.querySelector(modalToggle.href.replace(/^.*#/, '#')) as HTMLElement;
    if (!modal || !modal.matches('.modal')) return;
    
    $FRMDB_MODAL(modal);
});
