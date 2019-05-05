import { Entity } from "@core/domain/metadata/entity";
import { TablePage } from "@core/domain/uimetadata/table-page";
import { FrmdbLy } from "@core/domain/uimetadata/page";

import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";

import { generateUUID } from "@core/domain/uuid";
import { TableColumn, NodeType } from "@core/domain/uimetadata/node-elements";
import { elvis } from "@core/elvis";

export function autoLayoutTable(table: TablePage | null, entity: Entity, layout?: FrmdbLy): TablePage {
    const retTable: TablePage = table || {
        _id: 'TablePage:AUTOLAYOUT^^' + entity._id,
        nodeType: NodeType.root_node
    };

    retTable.layout = elvis(table).layout || FrmdbLy.ly_admin,
    retTable.childNodes = [{
        _id: generateUUID(),  
        nodeType: NodeType.data_grid,
        refEntityName: entity._id,
        columns: _.values(entity.props).map(pn => ({
            _id: generateUUID(),
            name: pn.name, 
            type: pn.propType_
        } as TableColumn))
    }];

    return retTable;
}
