import { debounce } from "lodash";
import { ThemeColors } from "@domain/uimetadata/theme";
import { AlertComponent } from "./alert/alert.component";
import { MwzEvents } from "@domain/event";
import { waitUntil } from "@domain/ts-utils";
import { I18N } from "./i18n.service";

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
class SecondaryNotificationContainerComponent extends HTMLElement {
    connectedCallback() {
        this.style.position = 'fixed';
        this.style.bottom = '0';
        this.style.left = '0';
        this.style.padding = '5px';
        this.style.zIndex = '56789';
        this.style.visibility = 'hidden';
        this.style.opacity = '0';
        this.style.transition = 'visibility 0s, opacity 0.5s linear';
        this.classList.add('alert', 'alert-info', 'shadow');
    }
}
customElements.define('frmdb-secondary-notification-container', SecondaryNotificationContainerComponent);

let NotificationContainer: HTMLElement | null = null;
let SecondaryNotificationContainer: HTMLElement | null = null;

document.addEventListener('DOMContentLoaded', function() {
    NotificationContainer = document.querySelector('frmdb-notification-container') as HTMLElement;
    if (!NotificationContainer) {
        NotificationContainer = document.createElement('frmdb-notification-container');
        document.body.appendChild(NotificationContainer);
    }
    SecondaryNotificationContainer = document.querySelector('frmdb-secondary-notification-container') as HTMLElement;
    if (!SecondaryNotificationContainer) {
        SecondaryNotificationContainer = document.createElement('frmdb-secondary-notification-container');
        document.body.appendChild(SecondaryNotificationContainer);
    }
});

let nbLoading: number = 0;
window.onload = function () {
    let originalFetch = window.fetch;
    window.fetch = async function(input: RequestInfo, ...args) {
        if (SecondaryNotificationContainer && input.toString().indexOf('/changes-feed/') < 0) {
            SecondaryNotificationContainer.style.visibility = 'visible';
            SecondaryNotificationContainer.style.opacity = '1';
            SecondaryNotificationContainer.innerHTML = `Loading ${input.toString()} ...`;
            nbLoading++;
        }
        try {
            let ret = await originalFetch(input, ...args);
            return ret;
        } catch (err) {
            throw err;
        } finally {
            if (SecondaryNotificationContainer && input.toString().indexOf('/changes-feed/') < 0) {
                nbLoading--;
                if (nbLoading == 0) {
                    SecondaryNotificationContainer.style.visibility = 'hidden';
                    SecondaryNotificationContainer.style.opacity = '0';
                }
            }
        }
    }
}

export function raiseNotification(severity: ThemeColors, title: string, msg: string) {
    if (!NotificationContainer) {
        (async () => {
            await waitUntil(() => Promise.resolve(NotificationContainer));
            raiseNotification(severity, title, msg);
        })();
        return;
    }
    let alertEl: AlertComponent = document.createElement('frmdb-alert') as AlertComponent;
    alertEl.change({
        eventTitle: title,
        eventDetail: msg,
        severity: severity as any,
    });
    NotificationContainer.append(alertEl);
}

export function removeSingletonNotification(id: string) {
    if (!NotificationContainer) return;
        let existingAlert = NotificationContainer.querySelector(`#${id}`);
    if (existingAlert) NotificationContainer.removeChild(existingAlert);
}
export function raiseSingletonNotification(id: string, severity: ThemeColors, title: string, msg: string, fade?: boolean) {
    if (!NotificationContainer) {
        (async () => {
            await waitUntil(() => Promise.resolve(NotificationContainer));
            raiseSingletonNotification(id, severity, title, msg);
        })();
        return;
    }
    removeSingletonNotification(id);
    let alertEl: AlertComponent = document.createElement('frmdb-alert') as AlertComponent;
    alertEl.id = id;
    alertEl.change({
        eventTitle: title,
        eventDetail: msg,
        severity: severity as any,
    });
    NotificationContainer.append(alertEl);
    if (fade) {
        alertEl.classList.add('animated', 'fadeOut');
        setTimeout(() => NotificationContainer?.removeChild(alertEl), 1200);
    }
}

export function notifyUserAboutEvent(event: MwzEvents) {
    if (event.state_ === "ABORT") {
        raiseNotification(ThemeColors.warning, "Error", event.error_ ? I18N.terr(event.error_) : 'internal error processing event ' + event.type_);
    } else {
        raiseNotification(ThemeColors.success, "Success", event.type_);
    }
}
