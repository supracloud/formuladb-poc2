import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { Entity, EntityProperties, ScalarEntityProperty } from "@domain/metadata/entity";
import { FormPage, getFormPageEntityId } from "@domain/uimetadata/form-page";
import { TablePage, getTablePageEntityId } from "@domain/uimetadata/table-page";
import { NodeElementWithChildren, NodeType, FormText, NodeElement, GridContainer, ScalarNodeElement, DataGrid, TableColumn, Image, MediaContainer, isCard, isMedia, Card, Media } from "@domain/uimetadata/node-elements";

import * as _ from "lodash";

import { Pn } from "@domain/metadata/entity";

import { generateUUID } from "@domain/uuid";
import { elvis } from "@core/elvis";

import * as appState from '../state/app.state';
import { FrmdbLayoutType } from "@domain/uimetadata/page";

let AUTOLAYOUTSERVICE: AutoLayoutService | undefined = undefined;

export function autoLayoutFormPage(formPage: FormPage, entity?: Entity, layout?: FrmdbLayoutType): FormPage {
    if (AUTOLAYOUTSERVICE) {
        return AUTOLAYOUTSERVICE.autoLayoutFormPage(formPage, entity, layout);
    } else return formPage;
}

export function autoLayoutTablePage(tablePage: FormPage, entity?: Entity, layout?: FrmdbLayoutType): TablePage {
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

    public autoLayoutFormPage(formPage: FormPage, entity?: Entity, layout?: FrmdbLayoutType): FormPage {
        if (entity) this.cachedEntitiesMap[entity._id] = entity;
        let retForm: FormPage = {...formPage};

        retForm.isEditable = elvis(entity).isEditable;
        retForm.stateGraph = elvis(entity).stateGraph;
        retForm.layout = layout || retForm.layout || "frmdb-ly-admin";

        this.autoLayoutChildren(retForm.layout!, retForm, (entity || this.cachedEntitiesMap[getFormPageEntityId(formPage)]).props);

        console.log('form:', retForm);
        return retForm;
    }

    private autoLayoutSpecialProperties(layout: FrmdbLayoutType, parentNodeEl: NodeElementWithChildren, entityProps: EntityProperties): string[] {
        let specialPropNames: string[] = [];
        parentNodeEl.childNodes = parentNodeEl.childNodes || [];

        if ("frmdb-ly-grid" === layout || "frmdb-ly-cards" === layout || "frmdb-ly-fpattern" === layout) {
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
                cssCards: isCard(parentNodeEl) ? ["card-title"] : [],
            };
            specialPropNames.push(titleProp.name);


            let subtitleProp = entityProps["subtitle"] || entityProps["description"] || entityProps["summary"] || { name: "subtitle", propType_: Pn.STRING};
            let subtitleNodeEl: FormText = {
                _id: parentNodeEl._id + "." + subtitleProp.name,
                nodeType: NodeType.form_text,
                propertyName: subtitleProp.name,
                propertyType: subtitleProp.propType_ as FormText['propertyType'],
                cssText: "h6",
                cssTextEx: "text-muted",
                cssMargin: "mb-3",
                cssCards: isCard(parentNodeEl) ? ["card-subtitle"] : [],
            };
            specialPropNames.push(subtitleProp.name);


            let textProp = entityProps["text"] || entityProps["long_description"];
            let textNodeEl: FormText | null = null;
            if (textProp) {
                textNodeEl = {
                    _id: parentNodeEl._id + "." + textProp.name,
                    nodeType: NodeType.form_text,
                    propertyName: textProp.name,
                    propertyType: textProp.propType_ as FormText['propertyType'],
                    cssMargin: "mb-3",
                    cssCards: isCard(parentNodeEl) ? ["card-text"] : [],
                };
                specialPropNames.push(textProp.name);
            }

            if (parentNodeEl.nodeType === NodeType.card || parentNodeEl.nodeType === NodeType.media) {
                parentNodeEl.imageNode = imgNodeEl;
                if (isMedia(parentNodeEl)) imgNodeEl.cssWidthViewport = "vw-35";
                parentNodeEl.titleNode = titleNodeEl;
                parentNodeEl.subtitleNode = subtitleNodeEl;
                if (null != textNodeEl) {
                    parentNodeEl.textNode = textNodeEl;
                }
            }
        }
    
        return specialPropNames;
    }

    private autoLayoutScalarProperty(layout: FrmdbLayoutType, parentNodeEl: NodeElementWithChildren, pn: ScalarEntityProperty): ScalarNodeElement {
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

            if ("frmdb-ly-admin" === layout || "frmdb-ly-form" === layout) {
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

            if ("frmdb-ly-grid" === layout || "frmdb-ly-cards" === layout || "frmdb-ly-fpattern" === layout) {
                child.cssCards = ["card-text"];
            }
        }
        
        return child;
    }

    private autoLayoutChildren(layout: FrmdbLayoutType, parentNodeEl: NodeElementWithChildren, entityProps: EntityProperties) {
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
                if ("frmdb-ly-mosaic" === layout || "frmdb-ly-cards" === layout || "frmdb-ly-grid" === layout) {
                    child = {
                        ...base,
                        nodeType: NodeType.grid_container,
                        cssLayout: "frmdb-ly-cards",
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
                if ("frmdb-ly-fpattern" === layout) {
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
            parentNodeEl.childNodes.push(child);
        };
    }

    public autoLayoutTable(table: TablePage, entity?: Entity, layout?: FrmdbLayoutType): TablePage {
        if (entity) this.cachedEntitiesMap[entity._id] = entity;
        const retTable: TablePage = {...table};
        entity = entity || this.cachedEntitiesMap[getTablePageEntityId(table)];
        let tableId = retTable._id + '.' + entity._id;

        retTable.layout = layout || elvis(table).layout || "frmdb-ly-admin";
        if (retTable.layout === "frmdb-ly-admin") {
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
        } else if (retTable.layout === "frmdb-ly-cards" || retTable.layout === "frmdb-ly-grid") {
            let card: Card = {
                _id: tableId + '-card',
                nodeType: NodeType.card,
                colspan: 4,
            };
            let gridContainer: GridContainer = {
                _id: tableId,
                nodeType: NodeType.grid_container,
                cssLayout: retTable.layout,
                refEntityName: entity._id,
                childNodes: [card]
            };
            this.autoLayoutChildren(retTable.layout!, card, entity.props);
            retTable.childNodes = [gridContainer];

            if (retTable.layout === "frmdb-ly-grid") {
            } else if (retTable.layout === "frmdb-ly-cards") {
                card.cssMargin = "mx-2";
            }
        } else if (retTable.layout === "frmdb-ly-fpattern" || retTable.layout === "frmdb-ly-zigzagpattern") {
            let media: Media = {
                _id: tableId + '-media',
                nodeType: NodeType.media,
                colspan: 12,
            };
            let gridContainer: GridContainer = {
                _id: tableId,
                nodeType: NodeType.grid_container,
                cssLayout: retTable.layout,
                refEntityName: entity._id,
                childNodes: [media]
            };
            this.autoLayoutChildren(retTable.layout!, media, entity.props);
            retTable.childNodes = [gridContainer];

            if (retTable.layout === "frmdb-ly-fpattern") {
            } else if (retTable.layout === "frmdb-ly-zigzagpattern") {
                //TODO: use flex ordering to obtain the zigzag patterna and make the rows higer than f-pattern
            }
        }
        
        return retTable;
    }

    private wrapChild(parentNodeEl: NodeElementWithChildren, nodeEl: NodeElement, ...extraNodeEls: NodeElement[]): NodeElement {
        if (isCard(parentNodeEl)) {
            let childNodes = [nodeEl, ...extraNodeEls];
            return {
                _id: nodeEl._id + '-col',
                nodeType: NodeType.flex_layout, direction: "column",
                cssPadding: "px-0",
                cssMaxHeightPercent: "mh-45",
                childNodes: [nodeEl, ...extraNodeEls],
            }
        } else if (NodeType.grid_layout === parentNodeEl.nodeType) {
            return {
                _id: nodeEl._id + '-col',
                nodeType: NodeType.flex_layout, direction: "column",
                cssWidth: "wcol-4",
                childNodes: [nodeEl, ...extraNodeEls],
            }
        } else return {
            _id: nodeEl._id + '-col',
            nodeType: NodeType.flex_layout, direction: "column",
            childNodes: [nodeEl, ...extraNodeEls],
        }; 
    }    

}
