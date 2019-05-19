import { DataObj } from "@domain/metadata/data_obj";
import { Entity } from "@domain/metadata/entity";
import { SimpleAddHocQuery, ValidationState } from "@domain/metadata/simple-add-hoc-query";
import { VTree } from "virtual-dom";

export class IncrementalPageRenderer {

    state: {
        dataObj: DataObj;
        entity: Entity;
        validationErrors: {[selector: string]: ValidationState};
        queryState: {[selector: string]: SimpleAddHocQuery};
        current: VTree;
    }
    currentDataObj: DataObj;

    public updateViewWithNewTemplate() {
        
    }
}
