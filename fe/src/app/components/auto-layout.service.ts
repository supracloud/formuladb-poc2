import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { Entity, EntityProperty, EntityProperties, ImageProperty, StringProperty, ScalarEntityProperty } from "@core/domain/metadata/entity";
import { Page, FrmdbLy } from "@core/domain/uimetadata/page";
import { FormPage, getFormPageEntityId } from "@core/domain/uimetadata/form-page";
import { TablePage, getTablePageEntityId } from "@core/domain/uimetadata/table-page";
import { NodeElementWithChildren, FormTable, FormTabs, FormAutocomplete, NodeType, FormDatepicker, FormText, FormInput, GridRow, NodeElement, isNodeElementWithChildren, Button, CardContainer, ScalarNodeElement, DataGrid, TableColumn } from "@core/domain/uimetadata/node-elements";

import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";

import { generateUUID } from "@core/domain/uuid";
import { elvis } from "@core/elvis";

import * as appState from '../state/app.state';

let AUTOLAYOUTSERVICE: AutoLayoutService | undefined = undefined;

export function autoLayoutFormPage(formPage: FormPage, entity?: Entity, layout?: FrmdbLy): FormPage {
    if (AUTOLAYOUTSERVICE) {
        return AUTOLAYOUTSERVICE.autoLayoutFormPage(formPage, entity, layout);
    } else return formPage;
}

export function autoLayoutTablePage(tablePage: FormPage, entity?: Entity, layout?: FrmdbLy): TablePage {
    if (AUTOLAYOUTSERVICE) {
        return AUTOLAYOUTSERVICE.autoLayoutTable(tablePage, entity, layout);
    } else return tablePage;
}

@Injectable()
export class AutoLayoutService {
    private cachedEntitiesMap: _.Dictionary<Entity> = {};

    constructor(private store: Store<appState.AppState>) {
        this.store.select (appState.getEntitiesState).subscribe(entities => {
            entities.forEach(entity => this.cachedEntitiesMap[entity._id] = entity);
        });

        AUTOLAYOUTSERVICE = this;
    }

    public autoLayoutFormPage(formPage: FormPage, entity?: Entity, layout?: FrmdbLy): FormPage {
        if (entity) this.cachedEntitiesMap[entity._id] = entity;
        let retForm: FormPage = {...formPage};

        retForm.isEditable = elvis(entity).isEditable;
        retForm.stateGraph = elvis(entity).stateGraph;
        retForm.layout = layout || retForm.layout || FrmdbLy.ly_admin;

        this.autoLayoutChildren(retForm.layout!, retForm, (entity || this.cachedEntitiesMap[getFormPageEntityId(formPage)]).props);

        console.log('form:', retForm);
        return retForm;
    }

    private autoLayoutSpecialProperties(layout: FrmdbLy, parentNodeEl: NodeElementWithChildren, entityProps: EntityProperties): string[] {
        let specialPropNames: string[] = [];
        parentNodeEl.childNodes = parentNodeEl.childNodes || [];

        if (FrmdbLy.ly_grid === layout || FrmdbLy.ly_cards === layout || FrmdbLy.ly_fpattern === layout) {
            let imageProps = Object.values(entityProps).filter(pn => pn.propType_ === Pn.IMAGE);
            let imgPropName = "image";
            if (imageProps.length > 0) {
                imgPropName = imageProps[0].name;
                specialPropNames.push(imgPropName);
            }
            parentNodeEl.childNodes.push({
                _id: generateUUID(),
                nodeType: NodeType.image,
                propertyName: imgPropName,
            });

            let titleProp = entityProps["title"] || entityProps["name"] || { name: "title", propType_: Pn.STRING};
            parentNodeEl.childNodes.push({
                _id: generateUUID(),
                nodeType: NodeType.form_text,
                propertyName: titleProp.name,
                propertyType: titleProp.propType_ as FormText['propertyType'],
                cssText: "h5",
                cssMisc: ["card-title"],
            });
            specialPropNames.push(titleProp.name);


            let descProp = entityProps["description"] || entityProps["summary"] || { name: "subtitle", propType_: Pn.STRING};
            parentNodeEl.childNodes.push({
                _id: generateUUID(),
                nodeType: NodeType.form_text,
                propertyName: descProp.name,
                propertyType: descProp.propType_ as FormText['propertyType'],
                cssText: "h6",
                cssTextEx: "text-muted",
                cssMargin: "mb-3",
                cssMisc: ["card-subtitle"],
            });
            specialPropNames.push(descProp.name);
        }

        // title?: StringProperty;
        // subtitle?: StringProperty;
        // lead?: StringProperty;
    
        return specialPropNames;
    }

    private autoLayoutScalarProperty(layout: FrmdbLy, parentNodeEl: NodeElementWithChildren, pn: ScalarEntityProperty): ScalarNodeElement {
        let child: ScalarNodeElement;

        if (pn.propType_ === Pn.DATETIME) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.form_datepicker,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.IMAGE) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.image,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.ATTACHMENT) {
            child = {
                _id: generateUUID(),
                nodeType: NodeType.image,
                propertyName: pn.name,
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
                cssTextEx: "text-muted",
            };
        } else {
            let propertyType = pn.propType_ === Pn.FORMULA ? Pn.STRING : pn.propType_;//FIXME: compute FORMULA return type

            if (FrmdbLy.ly_admin === layout || FrmdbLy.ly_form === layout) {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.form_input,
                    propertyName: pn.name,
                    propertyType: propertyType,
                    noLabel: parentNodeEl.nodeType === NodeType.form_table,
                };
            } else {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.form_text,
                    propertyName: pn.name,
                    propertyType: propertyType,
                    noLabel: parentNodeEl.nodeType === NodeType.form_table,
                };
            }

            if (FrmdbLy.ly_grid === layout || FrmdbLy.ly_cards === layout || FrmdbLy.ly_fpattern === layout) {
                child.cssCards = ["card-text"];
            }
        }
        
        return child;
    }

    private autoLayoutChildren(layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entityProps: EntityProperties) {
        let referenceToDataGrids: Map<string, DataGrid> = new Map();
        parentFormEl.childNodes = parentFormEl.childNodes || [];
        let specialProps = this.autoLayoutSpecialProperties(layout, parentFormEl, entityProps);

        for (let pn of Object.values(entityProps)) {
            if (specialProps.includes(pn.name)) continue;
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
                        card: {
                            _id: generateUUID(),
                            nodeType: NodeType.card,
                        }
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

                if (pn.referencedEntityName) this.autoLayoutChildren(layout, child.nodeType == NodeType.card_container ? child.card : child, 
                    this.cachedEntitiesMap[pn.referencedEntityName]!.props);
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
            } else if (pn.propType_ === Pn.EXTENDS_ENTITY) {
                child = {
                    _id: generateUUID(),
                    nodeType: NodeType.data_grid,
                    refEntityName: pn.referencedEntityName,
                };
            } else {
                child = this.autoLayoutScalarProperty(layout, parentFormEl, pn);
            }

            parentFormEl.childNodes.push(child);
        };
    }

    public autoLayoutTable(table: TablePage, entity?: Entity, layout?: FrmdbLy): TablePage {
        if (entity) this.cachedEntitiesMap[entity._id] = entity;
        const retTable: TablePage = {...table};
        entity = entity || this.cachedEntitiesMap[getTablePageEntityId(table)];
    
        retTable.layout = layout || elvis(table).layout || FrmdbLy.ly_admin;
        if (retTable.layout === FrmdbLy.ly_admin) {
            
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
        } else {
            let cardContainer: CardContainer = {
                _id: generateUUID(),
                nodeType: NodeType.card_container,
                refEntityName: entity._id,
                card: { _id: generateUUID(), nodeType: NodeType.card },
            };
            retTable.childNodes = [cardContainer];
            this.autoLayoutChildren(retTable.layout!, cardContainer.card, entity.props);

            if (retTable.layout === FrmdbLy.ly_fpattern) {
                cardContainer.cssMisc = ["row"];
                cardContainer.card.cssWithInCols = "col-12";
            } else if (retTable.layout === FrmdbLy.ly_grid) {
                cardContainer.layout = retTable.layout; 
            } else if (retTable.layout === FrmdbLy.ly_cards) {
                cardContainer.layout = retTable.layout; 
            } else if (retTable.layout === FrmdbLy.ly_mosaic) {
                cardContainer.layout = retTable.layout; 
            }
        }
        
        return retTable;
    }
    
}
