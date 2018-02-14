import * as _ from 'lodash';

import { Entity, EntityProperty, PropertyTypeN, EntityProperties, ReferencedEntity } from "./domain/metadata/entity";
import { Table, TableColumn } from "./domain/uimetadata/table";
import { Form, NodeElement, NodeElementWithChildren, NodeType, FormInput, FormAutocomplete, FormTable, FormTabs, FormGridRow, FormGrid, isNodeElementWithChildren } from "./domain/uimetadata/form";
import { generateUUID } from "./domain/uuid";
import { BaseObj, isNonOverridableProperty } from './domain/base_obj';
import { KeyValueObj } from './domain/key_value_obj';

export function getEntityIdFromDeepPath(deepPath: string) {
    return parseDeepPath(deepPath).path;
}

export function getCopiedPropertiesFromReferencedObject<T extends {_id: string}>(obj: T, ref: ReferencedEntity): {ref_: string} {
    let {path, relativePath} = parseDeepPath(ref.deepPath);
    if (relativePath == null) return null;
    let objPath = [{pathSegment: path, obj: obj}];
    let currentObj = obj;

    relativePath.split(/\//).forEach(propName => {
        objPath.push({pathSegment: propName, obj: currentObj[propName]});
        currentObj = currentObj[propName];
    })

    let ret = {ref_: objPath.map(x => x.pathSegment + '/' + x.obj._id).join('/')};
    if (ref.copiedProperties != null) {
        ref.copiedProperties.forEach(propName => {
            let propPath = propName.split(/..\//);
            let realPropName = propPath.slice(-1)[0];
            let targetObj = objPath[objPath.length - propPath.length];
            ret[realPropName] = targetObj[realPropName];
        });
    }
    else _.extend(ret, obj);

    return ret;
}

export function queryEntityPropertiesWithDeepPath(entityProperties: EntityProperties, deepPath: string): EntityProperties {
    let relativePath = parseDeepPath(deepPath).relativePath;
    if (null != relativePath) {
        let pathInsideEntity = relativePath.replace(/\//, '.properties.');
        return eval(`entityProperties.${pathInsideEntity}.properties`) as EntityProperties;
    }
    return entityProperties;
}

function parseDeepPath(deepPath: string): {path: string, relativePath: string} {
    let match = deepPath.match(/^(\/\w+\/\w+)\/?(.*)/);
    if (null == match || match.length < 2) throw new Error("Not a valid deepPath: " + deepPath);

    if (match.length >= 3 && match[2] != null && match[2] !== '') {
        return {path: match[1], relativePath: match[2]};
    } else return {path: match[1], relativePath: match[2]};
}

export function typesafeDeepPath<E>(rootPath: string, entity: E, propName: keyof E) {
    return rootPath + '/' + propName;
}

export type EntityPropertiesWithNames = { name: string, prop: EntityProperty }[];
export function getEntityPropertiesWithNames(entityProperties: EntityProperties): EntityPropertiesWithNames {
    return _.toPairs(entityProperties).map(([propName, p]) => { return { name: propName, prop: p } });
}

export function extendEntityProperties(extendedEntityProperties: EntityProperties, newProperties: EntityProperties) {
    _.toPairs(newProperties).forEach(([propName, p]) => {
        if (isNonOverridableProperty(propName)) return;
        extendedEntityProperties[propName] = p;
    });
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
