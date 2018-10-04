/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { NonReservedPropNamesOf, ReservedPropNamesOf } from "../../domain/base_obj";
import { Entity, Pn, isEntityProperty, extendEntityProperties, queryEntityWithDeepPath, HasEntityProperties, EntityProperty, EntityProperties, Schema } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as FinancialMetadata from "./financial-metadata";
import { SchemaCompiler } from '../../schema_compiler';
import { SchemaDAO } from '../../domain/metadata/schema_dao';

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export class MockMetadata {
    public schema: Schema = {_id: 'FRMDB_SCHEMA', entities: {}};
    public entities: Entity[] = [];

    public constructor() {
        this.entities.push(GeneralMetadata.General);
        this.entities.push(GeneralMetadata.General___Actor);
        this.entities.push(GeneralMetadata.General___Settings);
        this.entities.push(GeneralMetadata.General___Currency);
        this.entities.push(GeneralMetadata.General___Person);
        this.entities.push(GeneralMetadata.General___User);
        this.entities.push(GeneralMetadata.General___Client);
        this.entities.push(InventoryMetadata.Inventory);
        this.entities.push(InventoryMetadata.Inventory___Order);
        this.entities.push(InventoryMetadata.Inventory___Order___Item);
        this.entities.push(InventoryMetadata.Inventory___Receipt);
        this.entities.push(InventoryMetadata.Inventory___Receipt___Item);
        this.entities.push(InventoryMetadata.Inventory___Product);
        this.entities.push(InventoryMetadata.Inventory___Product___Location);
        this.entities.push(InventoryMetadata.Inventory___ProductUnit);
        this.entities.push(FinancialMetadata.Financial);
        this.entities.push(FinancialMetadata.Financial___Account);
        this.entities.push(FinancialMetadata.Financial___Transaction);
        this.entities.push(FormsMetadata.Forms);
        this.entities.push(FormsMetadata.Forms___ServiceForm);
        this.entities.push(ReportsMetadata.Reports);
        this.entities.push(ReportsMetadata.Reports___DetailedCentralizerReport);
        this.entities.push(ReportsMetadata.Reports___ServiceCentralizerReport);
        
        this.entities.forEach(ent => {
            this.schema.entities[ent._id] = ent;
        });

        this.entities.forEach(ent => {
            // SchemaCompiler.applyInheritanceTo(ent, this.entitiesMap);
        });
    }
}
