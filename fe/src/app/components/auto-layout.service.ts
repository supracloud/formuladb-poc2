import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { Entity, EntityProperties, ScalarEntityProperty } from "@core/domain/metadata/entity";
import { FrmdbLy } from "@core/domain/uimetadata/page";
import { FormPage, getFormPageEntityId } from "@core/domain/uimetadata/form-page";
import { TablePage, getTablePageEntityId } from "@core/domain/uimetadata/table-page";
import { NodeElementWithChildren, NodeType, FormText, NodeElement, CardContainer, ScalarNodeElement, DataGrid, TableColumn, Image, MediaContainer } from "@core/domain/uimetadata/node-elements";

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
        let isCard = parentNodeEl.nodeType === NodeType.card || parentNodeEl.nodeType === NodeType.card_container;
        let isMediaObj = parentNodeEl.nodeType === NodeType.media || parentNodeEl.nodeType === NodeType.card_container;

        if (FrmdbLy.ly_grid === layout || FrmdbLy.ly_cards === layout || FrmdbLy.ly_fpattern === layout) {
            let imageProps = Object.values(entityProps).filter(pn => pn.propType_ === Pn.IMAGE);
            let imgPropName = "image";
            if (imageProps.length > 0) {
                imgPropName = imageProps[0].name;
                specialPropNames.push(imgPropName);
            }
            let imgNodeEl: Image = {
                _id: parentNodeEl._id + "." + imgPropName,
                nodeType: NodeType.image,
                propertyName: imgPropName,
            };

            let titleProp = entityProps["title"] || entityProps["name"] || { name: "title", propType_: Pn.STRING};
            let titleNodeEl: FormText = {
                _id: parentNodeEl._id + "." + titleProp.name,
                nodeType: NodeType.form_text,
                propertyName: titleProp.name,
                propertyType: titleProp.propType_ as FormText['propertyType'],
                cssText: "h5",
                cssMisc: isCard ? ["card-title"] : [],
            };
            specialPropNames.push(titleProp.name);


            let descProp = entityProps["subtitle"] || entityProps["description"] || entityProps["summary"] || { name: "subtitle", propType_: Pn.STRING};
            let subtitleNodeEl: FormText = {
                _id: parentNodeEl._id + "." + descProp.name,
                nodeType: NodeType.form_text,
                propertyName: descProp.name,
                propertyType: descProp.propType_ as FormText['propertyType'],
                cssText: "h6",
                cssTextEx: "text-muted",
                cssMargin: "mb-3",
                cssMisc: isCard ? ["card-subtitle"] : [],
            };
            specialPropNames.push(descProp.name);

            if (parentNodeEl.nodeType === NodeType.card || parentNodeEl.nodeType === NodeType.card_container|| parentNodeEl.nodeType === NodeType.media|| parentNodeEl.nodeType === NodeType.media_container) {
                parentNodeEl.imageNode = imgNodeEl;
                parentNodeEl.titleNode = titleNodeEl;
                parentNodeEl.subtitleNode = subtitleNodeEl;
            }
        }
    
        return specialPropNames;
    }

    private autoLayoutScalarProperty(layout: FrmdbLy, parentNodeEl: NodeElementWithChildren, pn: ScalarEntityProperty): ScalarNodeElement {
        let child: ScalarNodeElement;

        if (pn.propType_ === Pn.DATETIME) {
            child = {
                _id: parentNodeEl._id + "." + pn.name,
                nodeType: NodeType.form_datepicker,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.IMAGE) {
            child = {
                _id: parentNodeEl._id + "." + pn.name,
                nodeType: NodeType.image,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.ATTACHMENT) {
            child = {
                _id: parentNodeEl._id + "." + pn.name,
                nodeType: NodeType.image,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.ACTION) {
            child = {
                _id: parentNodeEl._id + "." + pn.name,
                nodeType: NodeType.button,
                propertyName: pn.name,
            };
        } else if (pn.propType_ === Pn.STRING && pn.name == '_id') {
            child = {
                _id: parentNodeEl._id + "." + pn.name,
                nodeType: NodeType.form_text,
                propertyName: pn.name,
                propertyType: pn.propType_,
                cssTextEx: "text-muted",
            };
        } else {
            let propertyType = pn.propType_ === Pn.FORMULA ? Pn.STRING : pn.propType_;//FIXME: compute FORMULA return type

            if (FrmdbLy.ly_admin === layout || FrmdbLy.ly_form === layout) {
                child = {
                    _id: parentNodeEl._id + "." + pn.name,
                    nodeType: NodeType.form_input,
                    propertyName: pn.name,
                    propertyType: propertyType,
                    noLabel: parentNodeEl.nodeType === NodeType.form_table,
                };
            } else {
                child = {
                    _id: parentNodeEl._id + "." + pn.name,
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

    private autoLayoutChildren(layout: FrmdbLy, parentNodeEl: NodeElementWithChildren, entityProps: EntityProperties) {
        let referenceToDataGrids: Map<string, DataGrid> = new Map();
        parentNodeEl.childNodes = parentNodeEl.childNodes || [];
        let specialProps = this.autoLayoutSpecialProperties(layout, parentNodeEl, entityProps);

        for (let pn of Object.values(entityProps)) {
            if (specialProps.includes(pn.name)) continue;
            let child: NodeElement;

            if (pn.propType_ === Pn.CHILD_TABLE) {
                let base = {
                    _id: parentNodeEl._id + "." + pn.name,
                    tableName: pn.name,
                    refEntityName: pn.referencedEntityName,
                }
                if (FrmdbLy.ly_mosaic === layout || FrmdbLy.ly_cards === layout || FrmdbLy.ly_grid === layout) {
                    child = {
                        ...base,
                        nodeType: NodeType.card_container,
                        cssCardLayout: "card-group",
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

                if (pn.referencedEntityName) this.autoLayoutChildren(layout, child, this.cachedEntitiesMap[pn.referencedEntityName]!.props);
            } else if (pn.propType_ === Pn.REFERENCE_TO) {
                if (FrmdbLy.ly_fpattern === layout) {
                    child = referenceToDataGrids.get(pn.referencedEntityName) || {
                        _id: parentNodeEl._id + "." + pn.name,
                        nodeType: NodeType.data_grid,
                        layout: layout,
                        autocompleteProperties: [],
                        refEntityName: pn.referencedEntityName,
                    };
                    referenceToDataGrids.set(pn.referencedEntityName, child);

                    child.autocompleteProperties!.push({
                        _id: parentNodeEl._id + "." + pn.name,
                        nodeType: NodeType.form_input,
                        refPropertyName: pn.referencedPropertyName,
                        propertyName: pn.name,
                        propertyType: /**FIXME!!!!! hardcoded heuristic */
                            ["price"].includes(pn.referencedPropertyName) ? Pn.NUMBER : Pn.STRING,
                    })
                } else {
                    child = {
                        _id: parentNodeEl._id + "." + pn.name,
                        nodeType: NodeType.form_autocomplete,
                        propertyName: pn.name,
                        refEntityName: pn.referencedEntityName,
                        refPropertyName: pn.referencedPropertyName,
                    }
                }
            } else if (pn.propType_ === Pn.EXTENDS_ENTITY) {
                child = {
                    _id: parentNodeEl._id + "." + pn.name,
                    nodeType: NodeType.data_grid,
                    refEntityName: pn.referencedEntityName,
                };
            } else {
                child = this.autoLayoutScalarProperty(layout, parentNodeEl, pn);
            }

            parentNodeEl.childNodes = parentNodeEl.childNodes || [];
            parentNodeEl.childNodes.push(this.wrapGridCol(child));
        };
    }

    public autoLayoutTable(table: TablePage, entity?: Entity, layout?: FrmdbLy): TablePage {
        if (entity) this.cachedEntitiesMap[entity._id] = entity;
        const retTable: TablePage = {...table};
        entity = entity || this.cachedEntitiesMap[getTablePageEntityId(table)];
        let tableId = retTable._id + '.' + entity._id;

        retTable.layout = layout || elvis(table).layout || FrmdbLy.ly_admin;
        if (retTable.layout === FrmdbLy.ly_admin) {
            retTable.childNodes = [{
                _id: tableId,  
                nodeType: NodeType.data_grid,
                refEntityName: entity._id,
                columns: _.values(entity.props).map(pn => ({
                    _id: tableId + "." + pn.name,
                    name: pn.name, 
                    type: pn.propType_
                } as TableColumn))
            }];
        } else if (retTable.layout === FrmdbLy.ly_cards || retTable.layout === FrmdbLy.ly_grid) {
            let cardContainer: CardContainer = {
                _id: tableId,
                nodeType: NodeType.card_container,
                cssCardLayout: "card-group",
                refEntityName: entity._id,
                childNodes: []
            };
            this.autoLayoutChildren(retTable.layout!, cardContainer, entity.props);
            retTable.childNodes = [cardContainer];

            if (retTable.layout === FrmdbLy.ly_grid) {
                cardContainer.cssCardLayout = "card-group";
            } else if (retTable.layout === FrmdbLy.ly_cards) {
                cardContainer.cssCardLayout = "card-deck";
            } else if (retTable.layout === FrmdbLy.ly_mosaic) {
                cardContainer.cssCardLayout = "card-columns";
                cardContainer.cssMisc = ["row", "w-100"];
            }
        } else if (retTable.layout === FrmdbLy.ly_fpattern || retTable.layout === FrmdbLy.ly_zigzagpattern) {
            let mediaContainer: MediaContainer = {
                _id: tableId,
                nodeType: NodeType.media_container,
                refEntityName: entity._id,
                childNodes: []
            };
            this.autoLayoutChildren(retTable.layout!, mediaContainer, entity.props);
            retTable.childNodes = [mediaContainer];

            if (retTable.layout === FrmdbLy.ly_fpattern) {
            } else if (retTable.layout === FrmdbLy.ly_zigzagpattern) {
                //TODO: use flex ordering to obtain the zigzag patterna and make the rows higer than f-pattern
            }
        }
        
        return retTable;
    }
    
    private wrapGridCol(nodeEl: NodeElement, ...extraNodeEls: NodeElement[]): NodeElement {
        return {
            _id: nodeEl._id + '-col',
            nodeType: NodeType.grid_col,
            childNodes: [nodeEl, ...extraNodeEls],
        }
    }    
    private wrapGridRow(nodeEl: NodeElement, ...extraNodeEls: NodeElement[]): NodeElement {
        return {
            _id: nodeEl._id + "-row", 
            nodeType: NodeType.grid_row,
            childNodes: [{
                _id: nodeEl._id + "-col",
                nodeType: NodeType.grid_col,
                childNodes: [nodeEl, ...extraNodeEls],
            }],
        }
    }
}
