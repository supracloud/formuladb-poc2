/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, EntityStateGraph } from "@core/domain/metadata/entity";
import { GEN__Actor } from "./general-metadata";


export const BookingItem = {
    _id: "BookingItem",
    props: {
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        picture: { name: "picture", propType_: Pn.IMAGE } as EntityProperty,
        long_description: { name: "long_description", propType_: Pn.STRING } as EntityProperty,
        price: { name: "price", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        booking_table: {
            name: 'booking_table',
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: "Booking",
            props: {},
            isLargeTable: true,
        } as EntityProperty,

    }
};

export const Booking = {
    _id: "Booking",
    stateGraph: {
        nodes: ['PENDING', 'FINALIZED', 'CANCELLED'],
        transitions: [
            { source: 'PENDING', target: 'FINALIZED' },
            { source: 'PENDING', target: 'CANCELLED' },
            { source: 'FINALIZED', target: 'CANCELLED' },
        ]
    } as EntityStateGraph,    
    props: {
        user_id: { name: "user_id", propType_: Pn.REFERENCE_TO, referencedEntityName: GEN__Actor._id, referencedPropertyName: '_id' } as EntityProperty,
        user_name: { name: "user_name", propType_: Pn.REFERENCE_TO, referencedEntityName: GEN__Actor._id, referencedPropertyName: GEN__Actor.props.name.name } as EntityProperty,
        booking_item_id: { name: "booking_item_id", propType_: Pn.REFERENCE_TO, referencedEntityName: BookingItem._id, referencedPropertyName: '_id' } as EntityProperty,
        booking_item_name: { name: "booking_item_name", propType_: Pn.REFERENCE_TO, referencedEntityName: BookingItem._id, referencedPropertyName: BookingItem.props.name.name } as EntityProperty,
        booking_item_price: { name: "booking_item_price", propType_: Pn.REFERENCE_TO, referencedEntityName: BookingItem._id, referencedPropertyName: BookingItem.props.price.name } as EntityProperty,
        start_date: { name: "start_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        end_date: { name: "end_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        days: { name: "days", propType_: Pn.FORMULA, formula: 'DATEDIF(start_date, end_date, "D") + 1' } as EntityProperty,
        cost: { name: "cost", propType_: Pn.FORMULA, formula: 'days * booking_item_price' } as EntityProperty,
        overlapping: { name: "overlapping", propType_: Pn.FORMULA, formula: 'COUNTIF(Booking.price, @[booking_item_id] == booking_item_id, $OVERLAP(start_date, end_date, @[start_date], @[end_date], "D"))' } as EntityProperty,
    }
}


export const BookingDay = {
    _id: "BookingDay",
    props: {
        booking_id: { name: "booking_id", propType_: Pn.REFERENCE_TO, referencedEntityName: Booking._id, referencedPropertyName: '_id' } as EntityProperty,
        date: { name: "date", propType_: Pn.DATETIME } as EntityProperty,
        state: { name: "name", propType_: Pn.FORMULA, formula: 'VLOOKUP()' } as EntityProperty,
    }
}

export const BookingApp = {
    _id: 'BookingApp',
    pureNavGroupingChildren: [BookingItem._id, Booking._id],
    props: {},
};
