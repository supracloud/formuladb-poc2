/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, EntityStateGraph, Schema } from "@domain/metadata/entity";
import { $s2e } from "@functions/s2e";
import { $User, $Dictionary } from "@domain/metadata/default-metadata";

export const RoomType = {
    _id: "RoomType",
    isEditable: true,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
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
    // validations: {
    //     noOverlap: { conditionExpr: $s2e('overlapping <= 10') }
    // },
};

export const Room = {
    _id: "Room",
    isEditable: true,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
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
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        guest: { name: "guest", propType_: Pn.REFERENCE_TO, referencedEntityName: $User._id, referencedPropertyName: '_id' } as EntityProperty,
        room: { name: "room", propType_: Pn.REFERENCE_TO, referencedEntityName: Room._id, referencedPropertyName: '_id' } as EntityProperty,
        start_date: { name: "start_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        end_date: { name: "end_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        nb_adults: { name: "nb_adults", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        nb_children: { name: "nb_children", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        days: { name: "days", propType_: Pn.FORMULA, formula: 'DATEDIF(start_date, end_date, "D") + 1' } as EntityProperty,
        cost: { name: "cost", propType_: Pn.FORMULA, formula: 'days * 100' } as EntityProperty,
        bookings_for_the_same_room: { name: "bookings_for_the_same_room", propType_: Pn.FORMULA, formula: '"FILTER(Booking, @[booking_item_id] == booking_item_id)"' } as EntityProperty,
        // booking_day_table: {
        //     name: 'booking_day_table',
        //     propType_: Pn.CHILD_TABLE,
        //     referencedEntityName: "BookingDay",
        //     props: {},
        //     isLargeTable: true,
        // } as EntityProperty,
    },
    validations: {
        maxBooking: { conditionExpr: $s2e('days < 20 && cost < 2000') }
    }
}

export const HotelBookingApp = {
    _id: "hotel-booking",
    description: "Booking app for Royal Hotel",
    pages: [
        { name: "index", html: "index.html" },
        { name: "booking", html: "booking.html" },
        { name: "footer-F", html: "footer._fragment_.html" },
        { name: "nav-F", html: "nav._fragment_.html" },
        { name: "booking-F", html: "booking._fragment_.html" },
        { name: "contact", html: "contact.html" },
        { name: "gallery", html: "gallery.html" },
        { name: "tmp", html: "tmp.html" },
    ],
};

export const HotelBookingSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~' + HotelBookingApp._id,
    entities: {
        [RoomType._id]: RoomType,
        [Room._id]: Room,
        [Booking._id]: Booking,
        [$User._id]: $User,
        [$Dictionary._id]: $Dictionary,
    },
}
