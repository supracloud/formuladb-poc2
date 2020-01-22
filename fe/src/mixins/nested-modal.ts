import { onEventChildren } from "@fe/delegated-events";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/


//Bootstram modals are not nestable

export class NestedModalsMixin {
    backdrop: HTMLElement;
    constructor(private modal: HTMLElement, zIndex: 1050 | 1070) {
        this.modal.style.zIndex = '' + zIndex;
        this.modal.parentElement!.append(this.backdrop);

        (this.modal.querySelector('[data-dismiss="modal"]') as HTMLElement).onclick = () => this.close();
        this.modal.onclick = (event) => {
            if (event.target === this.modal) {
                this.close()
            }
        }
    }

    open() {
        this.modal.classList.add('show', 'd-block');
        this.backdrop.classList.remove('d-none');
        this.backdrop.classList.add('show');
    }

    close() {
        this.modal.classList.remove('show', 'd-block');
        this.backdrop.classList.add('d-none');
        this.backdrop.classList.remove('show');
    }
}