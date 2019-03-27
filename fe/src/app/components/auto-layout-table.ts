import { Entity } from "@core/domain/metadata/entity";
import { Table } from "@core/domain/uimetadata/table";
import { Page, FrmdbLy } from "@core/domain/uimetadata/page";
import { NodeElementWithChildren, FormTable, FormTabs, FormAutocomplete, NodeType, FormDatepicker, FormText, FormInput, GridRow, NodeElement, isNodeElementWithChildren, Form, Button, CardContainer } from "@core/domain/uimetadata/form";

import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";

import { generateUUID } from "@core/domain/uuid";
import { TableColumn } from "@core/domain/uimetadata/table";
import { elvis } from "@core/elvis";

export function autoLayoutTable(table: Table | null, entity: Entity, layout?: FrmdbLy): Table {
    const retTable = table || new Table();
    retTable.columns = _.values(entity.props).map(pn => new TableColumn(pn.name, pn.propType_));
    retTable.page = {
        layout: layout || FrmdbLy.ly_admin,
    }
    if (!retTable._id) { retTable._id = 'Table_:AUTOLAYOUT^^' + entity._id; }
    addIdsToTable(retTable);
    return retTable;
}

export function addIdsToTable(input: Table): void {
    if (input) {
        if (!input._id) { input._id = generateUUID(); }
        if (input.columns && input.columns.length > 0) {
            input.columns.forEach(c => c._id = generateUUID());
        }
    }
}
