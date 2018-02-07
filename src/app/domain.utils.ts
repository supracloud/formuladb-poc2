import * as _ from 'lodash';

import { Entity, EntityProperty, PropertyTypeN, EntityProperties } from "./domain/metadata/entity";
import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeType, NodeType2Str } from "./domain/uimetadata/form";
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
    let form = {
        nodeType: NodeType.FormGrid,
        nodeName: 'form_grid',
        type_: "Form_",
        _id: 'Form_:' + entity._id
    } as Form;
    setFormElementChildren(form, entity, entitiesMap);
    console.log('form:', JSON.stringify(form));
    addIdsToForm(form);
    return form;
}

export function setFormElementChildren(parentFormEl: NodeElement, entity: Entity, entitiesMap: Map<string, Entity>) {
    parentFormEl.childNodes = _.toPairs(entity.properties).map(([propName, prop]) => {
        let child = new NodeElement();
        child.nodeType = NodeType.FormInput;
        child.nodeName = NodeType2Str.get(child.nodeType);
        if (prop.type === PropertyTypeN.TABLE) {
            child.tableName = propName;
            child.nodeType = prop.isLargeTable ? NodeType.FormTable : NodeType.FormTabs;
            setFormElementChildren(child, entitiesMap.get(prop.entity.deepPath), entitiesMap);
        } else if (prop.type === PropertyTypeN.REFERENCE_ENTITY) {
            child.entityName = propName;
            child.nodeType = NodeType.FormAutocomplete;
            child.attributes = { copiedProperties: prop.entity.copiedProperties };
        } else {
            child.propertyName = propName;
        }

        return {
            nodeType: NodeType.FormGridRow,
            nodeName: 'form_grid_row',
            childNodes: [child]
        };
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
    if (input.childNodes && input.childNodes.length > 0) {
        input.childNodes.forEach(c => addIdsToForm(c));
    }
}

export function addIdsToTable(input: Table): void {
    if (!input._id) { input._id = generateUUID(); }
    if (input.columns && input.columns.length > 0) {
        input.columns.forEach(c => c._id = generateUUID());
    }
}
