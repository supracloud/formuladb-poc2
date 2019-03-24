/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty } from "@core/domain/metadata/entity";
import { Fn } from "@core/domain/metadata/functions";
import { GEN__Actor } from "./general-metadata";


export const BookingItem = {
    _id: "BookingItem",
    props: {
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        picture: { name: "picture", propType_: Pn.IMAGE } as EntityProperty,
        long_description: { name: "long_description", propType_: Pn.STRING } as EntityProperty,
    }
};

export const Booking = {
    _id: "Booking",
    props: {
        user_id: { name: "user_id", propType_: Pn.REFERENCE_TO, referencedEntityName: GEN__Actor._id, referencedPropertyName: '_id' } as EntityProperty,
        user_name: { name: "user_name", propType_: Pn.REFERENCE_TO, referencedEntityName: GEN__Actor._id, referencedPropertyName: GEN__Actor.props.name.name } as EntityProperty,
        booking_item_id: { name: "booking_item_id", propType_: Pn.REFERENCE_TO, referencedEntityName: BookingItem._id, referencedPropertyName: '_id' } as EntityProperty,
        booking_item_name: { name: "booking_item_name", propType_: Pn.REFERENCE_TO, referencedEntityName: BookingItem._id, referencedPropertyName: BookingItem.props.name.name } as EntityProperty,
        start_date: { name: "start_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        end_date: { name: "end_date", propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
    }
}

export const BookingApp = {
    _id: 'BookingApp',
    pureNavGroupingChildren: [BookingItem._id, Booking._id],
    props: {},
};
