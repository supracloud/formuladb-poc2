import { Entity, EntityProperty } from "@core/domain/metadata/entity";
import { Page, FrmdbLy } from "@core/domain/uimetadata/page";
import { FormPage } from "@core/domain/uimetadata/form-page";
import { NodeElementWithChildren, FormTable, FormTabs, FormAutocomplete, NodeType, FormDatepicker, FormText, FormInput, GridRow, NodeElement, isNodeElementWithChildren, Button, CardContainer, ScalarNodeElement, DataGrid } from "@core/domain/uimetadata/node-elements";

import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";

import { generateUUID } from "@core/domain/uuid";
import { elvis } from "@core/elvis";

export function autoLayoutForm(form: FormPage | null, entity: Entity, entitiesMap: _.Dictionary<Entity>, pageOpts?: Partial<Page>): FormPage {
    let retForm: FormPage = form || {
        _id: 'FormPage:' + entity._id,
        nodeType: NodeType.root_node
    };
    retForm.isEditable = entity.isEditable;
    retForm.stateGraph = entity.stateGraph;
    retForm.layout = retForm.layout || FrmdbLy.ly_admin;

    autoLayoutChildren(retForm.layout!, retForm, entity, entitiesMap);

    console.log('form:', retForm);
    return retForm;
}

export function autoLayoutChildren(layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    let referenceToDataGrids: Map<string, DataGrid> = new Map();
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child: NodeElement;

        if (pn.propType_ === Pn.CHILD_TABLE) {
            let base = {
                _id: generateUUID(),
                tableName: pn.name,
                refEntityName: pn.referencedEntityName,
            }
            if (FrmdbLy.ly_mosaic === layout || FrmdbLy.ly_fpattern === layout) {
                child = {
                    ...base,
                    nodeType: NodeType.card_container,
                    layout: layout,
                };
            } else if (pn.isLargeTable) {
                child = { 
                    ...base,
                    nodeType: NodeType.form_table,
                }
            } else {
                child = {
                    ...base,
                    nodeType: NodeType.form_tabs,
                    tabNameFormPath: "_id",//FIXME: heuristic look for child properties "name"/"title"
                }
            }

            if (pn.referencedEntityName) autoLayoutChildren(layout, child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
        } else if (pn.propType_ === Pn.REFERENCE_TO) {
            if (FrmdbLy.ly_fpattern === layout) {
                child = referenceToDataGrids.get(pn.referencedEntityName) || {
                    _id: generateUUID(),
                    nodeType: NodeType.data_grid,
                    layout: layout,
                    autocompleteProperties: [],
                    refEntityName: pn.referencedEntityName,
                };
                referenceToDataGrids.set(pn.referencedEntityName, child);

                child.autocompleteProperties!.push({
                    _id: generateUUID(),
                    nodeType: NodeType.form_input,
                    refPropertyName: pn.referencedPropertyName,
                    propertyName: pn.name,
                    propertyType: /**FIXME!!!!! hardcoded heuristic */
                        ["price"].includes(pn.referencedPropertyName) ? Pn.NUMBER : Pn.STRING,
                })
            } else {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.form_autocomplete,
                    propertyName: pn.name,               
                    refEntityName: pn.referencedEntityName,
                    refPropertyName: pn.referencedPropertyName,
                }
            }
        } else if (pn.propType_ === Pn.DATETIME) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.form_datepicker,
                propertyName: pn.name,               
            };
        } else if (pn.propType_ === Pn.IMAGE) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.image,             
            };
        } else if (pn.propType_ === Pn.ATTACHMENT) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.image,             
            };
        } else if (pn.propType_ === Pn.EXTENDS_ENTITY) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.data_grid,
                refEntityName: pn.referencedEntityName,
            };
        } else if (pn.propType_ === Pn.ACTION) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.button,
                propertyName: pn.name,               
            };
        } else if (pn.propType_ === Pn.STRING && pn.name == '_id') {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.form_text,
                propertyName: pn.name,   
                propertyType: pn.propType_,            
                representation: "_id",
            };
        } else {
            let propertyType = pn.propType_ === Pn.FORMULA ? Pn.STRING : pn.propType_;//FIXME: compute FORMULA return type

            if (FrmdbLy.ly_admin === layout || FrmdbLy.ly_form === layout) {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.form_input,
                    propertyName: pn.name,   
                    propertyType: propertyType,            
                    noLabel: parentFormEl.nodeType === NodeType.form_table,
                };
            } else {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.form_text,
                    propertyName: pn.name,   
                    propertyType: propertyType,            
                    representation: "_id",
                    noLabel: parentFormEl.nodeType === NodeType.form_table,
                };    
            }
        }

        let ret;
        if (parentFormEl.nodeType === NodeType.form_table) {
            ret = child;
        } else {
            ret = {
                _id: generateUUID(),
                nodeType: NodeType.grid_row,
                childNodes: [child],
            };
        }

        return ret;
    });
}
