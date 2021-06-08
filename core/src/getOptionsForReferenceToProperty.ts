import * as _ from 'lodash';
import * as events from "@domain/event";
import { FrmdbEngineTransactionRunner } from "./frmdb_engine_transaction_runner";
import { parseDataObjId, DataObj } from "@domain/metadata/data_obj";
import { FrmdbEngineTools } from "./frmdb_engine_tools";
import { Pn, ReferenceToProperty } from "@domain/metadata/entity";
import { FrmdbEngineStore } from "./frmdb_engine_store";
import { SimpleAddHocQuery } from '@domain/metadata/simple-add-hoc-query';
import { logicalExpr2FilterModel } from './logicalExpr2FilterModel';

export async function getOptionsForReferenceToProperty(
    frmdbTransactionRunner: FrmdbEngineTransactionRunner,
    frmdbEngineStore: FrmdbEngineStore,
    frmdbEngineTools: FrmdbEngineTools,
    event: events.ServerEventPreComputeFormData,
    referencedTableName: string): Promise<DataObj[]> 
{
    let ret: DataObj[] = [];
    let objId = event.obj._id;
    let entity = frmdbEngineTools.schemaDAO.getEntityForDataObj(objId);
    let references: ReferenceToProperty[] = [];

    for (let prop of Object.values(entity.props)) {
        if (prop.propType_ === Pn.REFERENCE_TO && (prop.referencedEntityName === referencedTableName)) {
            references.push(prop);
        }
    }
    let baseEntity = frmdbEngineTools.schemaDAO.schema.entities[referencedTableName];
    let filterModel: SimpleAddHocQuery['filterModel'] = {};
    // for (let ref of references) {
    //     if (ref.filter) filterModel = {
    //         ...filterModel,
    //         ...logicalExpr2FilterModel(ref.filter)
    //     };
    // }
    let rows = await frmdbEngineStore.simpleAdHocQuery(referencedTableName, {
        startRow: 0,
        endRow: 100,
        rowGroupCols: [],
        valueCols: [],
        pivotCols: [],
        pivotMode: false,
        groupKeys: [],
        filterModel,
        sortModel: [],
    } as SimpleAddHocQuery);

    for (let row of rows) {
        let tmpObj = {
            ..._.cloneDeep(event.obj),
            ...row,
        }

        try {
            await frmdbTransactionRunner.preComputeOnly({
                ...event,
                obj: tmpObj,
            });
            ret.push(tmpObj);
        } catch (err) {
            console.trace("Failed validation for ", tmpObj);
        }
    }

    return ret;
}
