/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { Entity, Schema, Pn } from "@core/domain/metadata/entity";

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FinancialMetadata from "./financial-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as MusicBookingMetadata from "./musicbooking-metadata";
import * as StaticPagesMetadata from "../../default_pages/website-metadata";

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export enum ExampleApps {
    test = "test",
    inventory = "inventory",
    booking = "booking",
    expenses = "expenses",
    ticketing = "ticketing",
    planning = "planning",
    ecommerce = "ecommerce",
    service = "service",
    reporting = "reporting",
}

export class MockMetadata {
    public schema: Schema = { _id: 'FRMDB_SCHEMA', entities: {} };
    public entities: Entity[] = [];

    public constructor(app: ExampleApps) {
        this.entities.push(GeneralMetadata.General);
        this.entities.push(GeneralMetadata.GEN__Actor);
        this.entities.push(GeneralMetadata.GEN__Currency);
        this.entities.push(GeneralMetadata.GEN__Client);

        switch (app) {
            case ExampleApps.test:
                this.entities.push(StaticPagesMetadata.Home);
                this.entities.push(StaticPagesMetadata.ProductFeature);
                this.entities.push(StaticPagesMetadata.Dashboard);
                this.entities.push(StaticPagesMetadata.WebsiteStatistic);
                this.entities.push(StaticPagesMetadata.Pages);
                this.entities.push(StaticPagesMetadata.Ecommerce);
                this.entities.push(StaticPagesMetadata.Blog);
                this.entities.push(InventoryMetadata.Inventory);
                this.entities.push(InventoryMetadata.InventoryOrder);
                this.entities.push(InventoryMetadata.OrderItem);
                this.entities.push(InventoryMetadata.InventoryReceipt);
                this.entities.push(InventoryMetadata.ReceiptItem);
                this.entities.push(InventoryMetadata.InventoryProduct);
                this.entities.push(InventoryMetadata.ProductLocation);
                this.entities.push(InventoryMetadata.InventoryProductUnit);
                this.entities.push(InventoryMetadata.Reports);
                this.entities.push(InventoryMetadata.LargeSalesReport);
                this.entities.push(InventoryMetadata.LargeSalesProduct);
                break;
            case ExampleApps.service:
                this.entities.push(FormsMetadata.Forms);
                this.entities.push(FormsMetadata.Forms__ServiceForm);
                this.entities.push(ReportsMetadata.REP__DetailedCentralizerReport);
                this.entities.push(ReportsMetadata.REP__ServiceCentralizerReport);
            case ExampleApps.inventory:
                this.entities.push(InventoryMetadata.Inventory);
                this.entities.push(InventoryMetadata.InventoryOrder);
                this.entities.push(InventoryMetadata.OrderItem);
                this.entities.push(InventoryMetadata.InventoryReceipt);
                this.entities.push(InventoryMetadata.ReceiptItem);
                this.entities.push(InventoryMetadata.InventoryProduct);
                this.entities.push(InventoryMetadata.ProductLocation);
                this.entities.push(InventoryMetadata.InventoryProductUnit);
                this.entities.push(InventoryMetadata.Reports);
                this.entities.push(InventoryMetadata.LargeSalesReport);
                this.entities.push(InventoryMetadata.LargeSalesProduct);
                break;
            case ExampleApps.booking:
                this.entities.push(MusicBookingMetadata.MusicBooking);
                this.entities.push(MusicBookingMetadata.MBK__Service);
                this.entities.push(MusicBookingMetadata.MBK__Estimate);
                this.entities.push(MusicBookingMetadata.MBK__Estimate__Service);
                this.entities.push(MusicBookingMetadata.MBK__Session);
                this.entities.push(MusicBookingMetadata.MBK__Booking);
                this.entities.push(MusicBookingMetadata.MBK__Booking__Musician);
                this.entities.push(MusicBookingMetadata.MBK__Email);
                break;
            case ExampleApps.expenses:
                this.entities.push(FinancialMetadata.Financial);
                this.entities.push(FinancialMetadata.FIN__Account);
                this.entities.push(FinancialMetadata.FIN__Transaction);
                break;
            case ExampleApps.ticketing:
                break;
            case ExampleApps.planning:
                break;
            case ExampleApps.ecommerce:
                break;
        }

        this.entities.forEach(ent => {
            ent.props._id = { name: "_id", propType_: Pn.STRING, allowNull: false };
            ent.isEditable = true;
            this.schema.entities[ent._id] = ent;
        });

        this.entities.forEach(ent => {
            // SchemaCompiler.applyInheritanceTo(ent, this.entitiesMap);
        });
    }
}
