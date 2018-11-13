/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { Entity, Schema, Pn } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";

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
        this.entities.push(GeneralMetadata.General___Currency);
        this.entities.push(GeneralMetadata.General___Client);
        this.entities.push(InventoryMetadata.Inventory);
        this.entities.push(InventoryMetadata.Inventory___Order);
        this.entities.push(InventoryMetadata.Inventory___Order___Item);
        this.entities.push(InventoryMetadata.Inventory___Receipt);
        this.entities.push(InventoryMetadata.Inventory___Receipt___Item);
        this.entities.push(InventoryMetadata.Inventory___Product);
        this.entities.push(InventoryMetadata.Inventory___Product___Location);
        // this.entities.push(InventoryMetadata.Inventory___ProductUnit);
        // this.entities.push(FinancialMetadata.Financial);
        // this.entities.push(FinancialMetadata.Financial___Account);
        // this.entities.push(FinancialMetadata.Financial___Transaction);
        // this.entities.push(FormsMetadata.Forms);
        // this.entities.push(FormsMetadata.Forms___ServiceForm);
        // this.entities.push(ReportsMetadata.Reports);
        // this.entities.push(ReportsMetadata.Reports___DetailedCentralizerReport);
        // this.entities.push(ReportsMetadata.Reports___ServiceCentralizerReport);
        
        this.entities.forEach(ent => {
            ent.props._id = { name: "_id", propType_: Pn.STRING, allowNull: false };
            this.schema.entities[ent._id] = ent;
        });

        this.entities.forEach(ent => {
            // SchemaCompiler.applyInheritanceTo(ent, this.entitiesMap);
        });
    }
}
