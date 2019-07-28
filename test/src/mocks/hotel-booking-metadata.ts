/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, EntityStateGraph, Schema } from "@domain/metadata/entity";
import { $s2e } from "@functions/s2e";
import { $User } from "@domain/metadata/default-metadata";

export const RoomType = {
    _id: "RoomType",
    isEditable: true,
    props: {
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        picture: { name: "picture", propType_: Pn.IMAGE } as EntityProperty,
        long_description: { name: "long_description", propType_: Pn.STRING } as EntityProperty,
        price: { name: "price", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        wifi: { name: "wifi", propType_: Pn.BOOLEAN } as EntityProperty,
        parking: { name: "parking", propType_: Pn.BOOLEAN } as EntityProperty,
        // overlapping: { name: "overlapping", propType_: Pn.FORMULA, formula: 'COUNTIF(Booking.price, @[booking_item_id] == booking_item_id, $OVERLAP(start_date, end_date, @[start_date], @[end_date], "D"))' } as EntityProperty,
        // overlapping: { name: "overlapping", propType_: Pn.FORMULA, formula: 'COUNTIF(Booking.cost, booking_item_id == @[_id])' } as EntityProperty,
        // booking_table: {
        //     name: 'booking_table',
        //     propType_: Pn.CHILD_TABLE,
        //     referencedEntityName: "Booking",
        //     props: {},
        //     isLargeTable: true,
        // } as EntityProperty,
    },
    validations: {
        noOverlap: { conditionExpr: $s2e('overlapping <= 10') }
    },
};

export const Room = {
    _id: "RoomT",
    isEditable: true,
    props: {
        nb: { name: "nb", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        room_type: { name: "room_type", propType_: Pn.REFERENCE_TO, referencedEntityName: RoomType._id, referencedPropertyName: '_id' } as EntityProperty,
    }
};

export const Booking = {
    _id: "Booking",
    isEditable: true,
    stateGraph: {
        nodes: ['PENDING', 'FINALIZED', 'CANCELLED'],
        transitions: [
            { source: 'PENDING', target: 'FINALIZED' },
            { source: 'PENDING', target: 'CANCELLED' },
            { source: 'FINALIZED', target: 'CANCELLED' },
        ]
    } as EntityStateGraph,    
    props: {
        user: { name: "user_id", propType_: Pn.REFERENCE_TO, referencedEntityName: $User._id, referencedPropertyName: '_id' } as EntityProperty,
        room: { name: "booking_item_id", propType_: Pn.REFERENCE_TO, referencedEntityName: Room._id, referencedPropertyName: '_id' } as EntityProperty,
        start_date: { name: "start_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        end_date: { name: "end_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        days: { name: "days", propType_: Pn.FORMULA, formula: 'DATEDIF(start_date, end_date, "D") + 1' } as EntityProperty,
        cost: { name: "cost", propType_: Pn.FORMULA, formula: 'days * booking_item_price' } as EntityProperty,
        bookings_for_the_same_room: { name: "bookings_for_the_same_room", propType_: Pn.FORMULA, formula: '"FILTER(Booking, @[booking_item_id] == booking_item_id)"' } as EntityProperty,
        // booking_day_table: {
        //     name: 'booking_day_table',
        //     propType_: Pn.CHILD_TABLE,
        //     referencedEntityName: "BookingDay",
        //     props: {},
        //     isLargeTable: true,
        // } as EntityProperty,
    },
}

export const HotelBookingApp = {
    _id: "royal-hotel",
    description: "Booking app for Royal Hotel",
    pages: [
        { name: "index", html: "index.html" },
        { name: "booking", html: "booking.html" },
        { name: "footer [F]", html: "footer._fragment_.html" },
        { name: "nav [F]", html: "nav._fragment_.html" },
        { name: "booking [F]", html: "booking._fragment_.html" },
        { name: "index [T]", html: "index._template_.html" },
        { name: "accommodation [T]", html: "accommodation._template_.html" },
        { name: "contact [T]", html: "contact._template_.html" },
        { name: "gallery [T]", html: "gallery._template_.html" },
    ],
};

export const HotelBookingSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~' + HotelBookingApp._id,
    entities: {
        [RoomType._id]: RoomType,
        [Room._id]: Room,
        [Booking._id]: Booking,
    },
}
