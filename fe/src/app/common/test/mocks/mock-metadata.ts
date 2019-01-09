/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { Entity, Schema, Pn } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FinancialMetadata from "./financial-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as OrbicoMetadata from "./orbico-metadata";
import * as MusicBookingMetadata from "./musicbooking-metadata";

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
        this.entities.push(InventoryMetadata.INV___Order);
        this.entities.push(InventoryMetadata.INV___Order___Item);
        this.entities.push(InventoryMetadata.INV___Receipt);
        this.entities.push(InventoryMetadata.INV___Receipt___Item);
        this.entities.push(InventoryMetadata.INV___PRD);
        this.entities.push(InventoryMetadata.INV___PRD___Location);
        this.entities.push(InventoryMetadata.INV___PRD___Unit);
        
        this.entities.push(FinancialMetadata.Financial);
        this.entities.push(FinancialMetadata.Financial___Account);
        this.entities.push(FinancialMetadata.Financial___Transaction);

        this.entities.push(FormsMetadata.Forms);
        this.entities.push(FormsMetadata.Forms___ServiceForm);

        this.entities.push(ReportsMetadata.Reports);
        this.entities.push(ReportsMetadata.REP___DetailedCentralizerReport);
        this.entities.push(ReportsMetadata.REP___ServiceCentralizerReport);
        this.entities.push(ReportsMetadata.REP___LargeSales);
        this.entities.push(ReportsMetadata.REP___LargeSales___Product);

        this.entities.push(MusicBookingMetadata.MusicBooking);
        this.entities.push(MusicBookingMetadata.MBK___Service);
        this.entities.push(MusicBookingMetadata.MBK___Estimate);
        this.entities.push(MusicBookingMetadata.MBK___Estimate___Service);
        this.entities.push(MusicBookingMetadata.MBK___Session);
        this.entities.push(MusicBookingMetadata.MBK___Booking);
        this.entities.push(MusicBookingMetadata.MBK___Booking___Musician);
        this.entities.push(MusicBookingMetadata.MBK___Email);

        this.entities.forEach(ent => {
            ent.props._id = { name: "_id", propType_: Pn.STRING, allowNull: false };
            this.schema.entities[ent._id] = ent;
        });

        this.entities.forEach(ent => {
            // SchemaCompiler.applyInheritanceTo(ent, this.entitiesMap);
        });
    }
}
