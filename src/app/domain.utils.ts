import * as _ from 'lodash';

import { Entity, EntityProperty, PropertyTypeN, EntityProperties } from "./domain/metadata/entity";
import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeElementWithChildren, NodeType, FormInput, FormAutocomplete, FormTable, FormTabs, FormGridRow, FormGrid, isNodeElementWithChildren } from "./domain/uimetadata/form";
import { generateUUID } from "./domain/uuid";

export function getEntityIdFromDeepPath(path: string) {
    let match = path.match(/^\/(\w+\/\w+)\/?.*/);
    if (null != match) {
        return match[1];
    } else {
        throw new Error("path " + path + " does not contain an Entity _id!");
    }
}

export type EntityPropertiesWithNames = {name: string, prop: EntityProperty}[];
export function getEntityPropertiesWithNames(entityProperties: EntityProperties): EntityPropertiesWithNames {
    return _.toPairs(entityProperties).map(([propName, p]) => {return {name: propName, prop: p}});
}

export function getDefaultForm(entity: Entity, entitiesMap: Map<string, Entity>): Form {
    let form = new Form();
    form._id = 'Form_:' + entity._id
    form.grid = new FormGrid();

    setFormElementChildren(form.grid, entity, entitiesMap);
    console.log('form:', JSON.stringify(form));
    addIdsToForm(form.grid);
    return form;
}

export function setFormElementChildren(parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: Map<string, Entity>) {
    parentFormEl.childNodes = _.toPairs(entity.properties).map(([propName, prop]) => {
        let child = null;
        if (prop.type === PropertyTypeN.TABLE) {
            child = prop.isLargeTable ? new FormTable() : new FormTabs();
            child.tableName = propName;
            setFormElementChildren(child, entitiesMap.get(prop.entity.deepPath), entitiesMap);
        } else if (prop.type === PropertyTypeN.REFERENCE_ENTITY) {
            child = new FormAutocomplete();
            child.entityName = propName;
            child.attributes = { copiedProperties: prop.entity.copiedProperties };
        } else {
            child = new FormInput();
            child.propertyName = propName;
        }

        let ret = new FormGridRow();
        ret.childNodes = [child];
        return ret;
    });

}

export function getDefaultTable(entity: Entity): Table {
    if (null == entity) return null;

    let table = new Table();
    table.columns = _.toPairs(entity.properties).map(([propName, prop]) => new TableColumn(propName, prop.type));
    addIdsToTable(table);
    return table;
}


export function addIdsToForm(input: NodeElement): void {
    if (!input._id) { input._id = generateUUID(); }
    if (isNodeElementWithChildren(input) && input.childNodes.length > 0) {
        input.childNodes.forEach(c => addIdsToForm(c));
    }
}

export function addIdsToTable(input: Table): void {
    if (!input._id) { input._id = generateUUID(); }
    if (input.columns && input.columns.length > 0) {
        input.columns.forEach(c => c._id = generateUUID());
    }
}
