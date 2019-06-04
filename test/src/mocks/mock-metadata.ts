/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { Schema, Pn } from "@domain/metadata/entity";

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FinancialMetadata from "./financial-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as MusicBookingMetadata from "./musicbooking-metadata";
import * as StaticPagesMetadata from "../default_pages/website-metadata";
import * as Booking from './booking-metadata';
import { App } from '@domain/app';
import { $User, $I18n } from '@domain/metadata/default-metadata';

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export const App_test: App = {
    _id: "App~~test",
    description: "Test many types of entities",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_test: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_test._id.replace(/^App~~/, ''),
    entities: {
        [StaticPagesMetadata.Home._id]: StaticPagesMetadata.Home,
        [StaticPagesMetadata.ProductFeature._id]: StaticPagesMetadata.ProductFeature,
        [StaticPagesMetadata.Components._id]: StaticPagesMetadata.Components,
        [StaticPagesMetadata.WebsiteStatistic._id]: StaticPagesMetadata.WebsiteStatistic,
        [StaticPagesMetadata.Pages._id]: StaticPagesMetadata.Pages,
        [StaticPagesMetadata.Ecommerce._id]: StaticPagesMetadata.Ecommerce,
        [StaticPagesMetadata.Blog._id]: StaticPagesMetadata.Blog,
        [InventoryMetadata.Inventory._id]: InventoryMetadata.Inventory,
        [InventoryMetadata.InventoryOrder._id]: InventoryMetadata.InventoryOrder,
        [InventoryMetadata.OrderItem._id]: InventoryMetadata.OrderItem,
        [InventoryMetadata.InventoryReceipt._id]: InventoryMetadata.InventoryReceipt,
        [InventoryMetadata.ReceiptItem._id]: InventoryMetadata.ReceiptItem,
        [InventoryMetadata.InventoryProduct._id]: InventoryMetadata.InventoryProduct,
        [InventoryMetadata.ProductLocation._id]: InventoryMetadata.ProductLocation,
        [InventoryMetadata.InventoryProductUnit._id]: InventoryMetadata.InventoryProductUnit,
        [InventoryMetadata.Reports._id]: InventoryMetadata.Reports,
        [InventoryMetadata.LargeSalesReport._id]: InventoryMetadata.LargeSalesReport,
        [InventoryMetadata.LargeSalesProduct._id]: InventoryMetadata.LargeSalesProduct,
    }
}
export const App_inventory: App = {
    _id: "App~~inventory",
    description: "Basic Inventory, Single Warehouse",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_inventory: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_inventory._id.replace(/^App~~/, ''),
    entities: {
        [GeneralMetadata.GEN__Currency._id]: GeneralMetadata.GEN__Currency,
        [GeneralMetadata.GEN__Client._id]: GeneralMetadata.GEN__Client,
        [InventoryMetadata.Inventory._id]: InventoryMetadata.Inventory,
        [InventoryMetadata.InventoryOrder._id]: InventoryMetadata.InventoryOrder,
        [InventoryMetadata.OrderItem._id]: InventoryMetadata.OrderItem,
        [InventoryMetadata.InventoryReceipt._id]: InventoryMetadata.InventoryReceipt,
        [InventoryMetadata.ReceiptItem._id]: InventoryMetadata.ReceiptItem,
        [InventoryMetadata.InventoryProduct._id]: InventoryMetadata.InventoryProduct,
        [InventoryMetadata.ProductLocation._id]: InventoryMetadata.ProductLocation,
        [InventoryMetadata.InventoryProductUnit._id]: InventoryMetadata.InventoryProductUnit,
        [InventoryMetadata.Reports._id]: InventoryMetadata.Reports,
        [InventoryMetadata.LargeSalesReport._id]: InventoryMetadata.LargeSalesReport,
        [InventoryMetadata.LargeSalesProduct._id]: InventoryMetadata.LargeSalesProduct,
    }
}
export const App_musicbooking: App = {
    _id: "App~~musicbooking",
    description: "Music Studio Booking",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_musicbooking: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_musicbooking._id.replace(/^App~~/, ''),
    entities: {
        [MusicBookingMetadata.MusicBooking._id]: MusicBookingMetadata.MusicBooking,
        [MusicBookingMetadata.MBK__Service._id]: MusicBookingMetadata.MBK__Service,
        [MusicBookingMetadata.MBK__Estimate._id]: MusicBookingMetadata.MBK__Estimate,
        [MusicBookingMetadata.MBK__Estimate__Service._id]: MusicBookingMetadata.MBK__Estimate__Service,
        [MusicBookingMetadata.MBK__Session._id]: MusicBookingMetadata.MBK__Session,
        [MusicBookingMetadata.MBK__Booking._id]: MusicBookingMetadata.MBK__Booking,
        [MusicBookingMetadata.MBK__Booking__Musician._id]: MusicBookingMetadata.MBK__Booking__Musician,
        [MusicBookingMetadata.MBK__Email._id]: MusicBookingMetadata.MBK__Email,
    },
}
export const App_booking: App = {
    _id: "App~~booking",
    description: "Booking Items (e.g. rooms, events, cars)",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_booking: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_booking._id.replace(/^App~~/, ''),
    entities: {
        [Booking.BookingApp._id]: Booking.BookingApp,
        [Booking.BookingItem._id]: Booking.BookingItem,
        [Booking.Booking._id]: Booking.Booking,
    },
}
export const App_expenses: App = {
    _id: "App~~expenses",
    description: "Expenses, Accounts, Transactions, Budgets",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_expenses: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_expenses._id.replace(/^App~~/, ''),
    entities: {
        [FinancialMetadata.Financial._id]: FinancialMetadata.Financial,
        [FinancialMetadata.FIN__Account._id]: FinancialMetadata.FIN__Account,
        [FinancialMetadata.FIN__Transaction._id]: FinancialMetadata.FIN__Transaction,
    },
}
export const App_ticketing: App = {
    _id: "App~~ticketing",
    description: "Ticketing, Issues",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_ticketing: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_ticketing._id.replace(/^App~~/, ''),
    entities: {},
}
export const App_planning: App = {
    _id: "App~~planning",
    description: "Planning, Meetings, Sessions",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_planning: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_planning._id.replace(/^App~~/, ''),
    entities: {},
}
export const App_ecommerce: App = {
    _id: "App~~ecommerce",
    description: "Basic eCommerce",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_ecommerce: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_ecommerce._id.replace(/^App~~/, ''),
    entities: {},
}
export const App_service: App = {
    _id: "App~~service",
    description: "Bike/Car Service",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_service: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_service._id.replace(/^App~~/, ''),
    entities: {
        [FormsMetadata.Forms._id]: FormsMetadata.Forms,
        [FormsMetadata.Forms__ServiceForm._id]: FormsMetadata.Forms__ServiceForm,
        [ReportsMetadata.REP__DetailedCentralizerReport._id]: ReportsMetadata.REP__DetailedCentralizerReport,
        [ReportsMetadata.REP__ServiceCentralizerReport._id]: ReportsMetadata.REP__ServiceCentralizerReport,
    },
}
export const App_reporting: App = {
    _id: "App~~reporting",
    description: "Reporting",
    page: { layout: "frmdb-ly-admin" },
};
export const Schema_reporting: Schema = {
    _id: 'FRMDB_SCHEMA~~' + App_reporting._id.replace(/^App~~/, ''),
    entities: {},
}
export class MockMetadata {
    public apps: App[];
    public schemas: Schema[];

    public commonEntities = [
        GeneralMetadata.General,
        $User,
        $I18n,
        // GeneralMetadata.GEN__Currency,
        // GeneralMetadata.GEN__Client,
        // StaticPagesMetadata.Home,
        // StaticPagesMetadata.ProductFeature,
    ];

    public constructor() {

        this.apps = [
            App_test,
            App_inventory,
            App_booking,
            App_expenses,
            App_ticketing,
            App_planning,
            App_ecommerce,
            App_service,
            App_reporting,
        ];

        this.schemas = [
            Schema_test,
            Schema_inventory,
            Schema_booking,
            Schema_expenses,
            Schema_ticketing,
            Schema_planning,
            Schema_ecommerce,
            Schema_service,
            Schema_reporting,
        ];

        for (let sch of this.schemas) {
            for (let commonEntity of this.commonEntities) {
                sch.entities[commonEntity._id] = commonEntity;    
            }

            for (let ent of Object.values(sch.entities)) {
                ent.props._id = { name: "_id", propType_: Pn.STRING, allowNull: false };
                ent.isEditable = true;    
            }
        }
    }
}
