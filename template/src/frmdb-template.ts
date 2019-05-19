import { DataObj } from "@domain/metadata/data_obj";
import { Entity } from "@domain/metadata/entity";
import { SimpleAddHocQuery, ValidationState } from "@domain/metadata/simple-add-hoc-query";

export class FrmdbTemplate {

    state: {
        dataObj: DataObj;
        entity: Entity;
        validationErrors: {[selector: string]: ValidationState};
        queryState: {[selector: string]: SimpleAddHocQuery};
        $template: JQuery;
        $page: JQuery;
    }
    currentDataObj: DataObj;

    constructor() {
        
    }

    public updateViewWithNewTemplate() {
        
    }
}
