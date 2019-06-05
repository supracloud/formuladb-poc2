import { FrmdbUserEvent } from "./frmdb-user-events";

export function handleUserEvent(event: FrmdbUserEvent) {
    switch(event.type) {
        case "UserAddRow":
            //TODOO
                // addRow() {
                //     this._ngZone.run(() => {
                //         if (this.currentEntity) {
                //             this.router.navigate(['./' + this.currentEntity._id + '~~'], { relativeTo: this.route });
                //         }
                //     })
                // }
            break;
        case "UserDeleteRow":
            //TODOO
                // deleteRow() {
                //     let nodes = this.gridApi.getSelectedNodes();
                //     if (nodes && nodes[0] && nodes[0].data && nodes[0].data._id && this.currentEntity) {
                //         if (confirm("Are you sure you want to delete row " + nodes[0].data._id + " ?")) {
                //             this.frmdbStreams.userEvents$.next({ type: "UserDeletedFormData", obj: nodes[0].data });
                //         }
                //     }
                // }
            break;
    }
}

