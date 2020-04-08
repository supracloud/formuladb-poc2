import { ThemeColors } from "@domain/uimetadata/theme";
import { AlertComponent } from "./alert/alert.component";
import { MwzEvents } from "@domain/event";


let NotificationContainer = document.createElement('div');
NotificationContainer.id = "frmdb-notification-container";
document.body.appendChild(NotificationContainer);
NotificationContainer.style.position = 'fixed';
NotificationContainer.style.top = '0';
NotificationContainer.style.right = '0';
NotificationContainer.style.padding = '5px';
NotificationContainer.style.zIndex = '56789';

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
