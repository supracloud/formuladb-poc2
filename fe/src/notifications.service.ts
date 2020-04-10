import { ThemeColors } from "@domain/uimetadata/theme";
import { AlertComponent } from "./alert/alert.component";
import { MwzEvents } from "@domain/event";

class NotificationContainerComponent extends HTMLElement {
    connectedCallback() {
        this.style.position = 'fixed';
        this.style.top = '0';
        this.style.right = '0';
        this.style.padding = '5px';
        this.style.zIndex = '56789';
    }
}
customElements.define('frmdb-notification-container', NotificationContainerComponent);

let NotificationContainer: HTMLElement = document.querySelector('frmdb-notification-container') as HTMLElement;
if (!NotificationContainer) {
    NotificationContainer = document.createElement('frmdb-notification-container');
    document.body.appendChild(NotificationContainer);
}


export function raiseNotification(severity: ThemeColors, title: string, msg: string) {
    let alertEl: AlertComponent = document.createElement('frmdb-alert') as AlertComponent;
    alertEl.change({
        eventTitle: title,
        eventDetail: msg,
        severity: severity as any,
    });
    NotificationContainer.append(alertEl);
}

export function notifyUserAboutEvent(event: MwzEvents) {
    if (event.state_ === "ABORT") {
        raiseNotification(ThemeColors.warning, "Error", event.error_ || 'internal error processing event ' + event.type_);
    } else {
        raiseNotification(ThemeColors.success, "Success", event.type_);
    }
}
