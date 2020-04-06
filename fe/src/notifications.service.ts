import { ThemeColors } from "@domain/uimetadata/theme";
import { AlertComponent } from "./alert/alert.component";


let NotificationContainer = document.createElement('div');
NotificationContainer.style.position = 'fixed';
NotificationContainer.style.top = '0';
NotificationContainer.style.right = '0';
NotificationContainer.style.padding = '5px';

export function raiseNotification(severity: ThemeColors, title: string, msg: string) {
    let alertEl: AlertComponent = document.createElement('frmdb-alert') as AlertComponent;
    alertEl.change({
        eventTitle: title,
        eventDetail: msg,
        severity: severity as any,
    });
    NotificationContainer.append(alertEl);
}
