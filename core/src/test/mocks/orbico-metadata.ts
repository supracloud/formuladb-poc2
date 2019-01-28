/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Pn, EntityProperty } from "@core/domain/metadata/entity";


export const Reports = {
    _id: "REP",
    module_: true,
    props: {},
};


export const REP__Orders = {
    _id: "REP__Orders",
    props: {
        id: { name: "id", propType_: Pn.STRING} as EntityProperty,
        state: { name: "state", propType_: Pn.STRING} as EntityProperty,
        client_code: { name: "client_code", propType_: Pn.STRING} as EntityProperty,
        actor_code: { name: "actor_code", propType_: Pn.STRING} as EntityProperty,
        address_code: { name: "address_code", propType_: Pn.STRING} as EntityProperty,
        address: { name: "address", propType_: Pn.STRING} as EntityProperty,
        city: { name: "city", propType_: Pn.STRING} as EntityProperty,
        external_id: { name: "external_id", propType_: Pn.STRING} as EntityProperty,
        details: { name: "details", propType_: Pn.STRING} as EntityProperty,
        created_at: { name: "created_at", propType_: Pn.STRING} as EntityProperty,
        updated_at: { name: "updated_at", propType_: Pn.STRING} as EntityProperty,
        client: { name: "client", propType_: Pn.STRING} as EntityProperty,
    }
};

export const REP__DeliveryRate = {
    _id: "REP__DeliveryRate",
    props: {
        ordernb: { name: "ordernb", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        externalordernb: { name: "externalordernb", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        ordercreationdate: { name: "ordercreationdate", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        clientcode: { name: "clientcode", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        client: { name: "client", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addresscode: { name: "addresscode", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addressname: { name: "addressname", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        group1: { name: "group1", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        group2: { name: "group2", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        group3: { name: "group3", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        group4: { name: "group4", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        location: { name: "location", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        productcode: { name: "productcode", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        barcode: { name: "barcode", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantity: { name: "quantity", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantityerror: { name: "quantityerror", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        price: { name: "price", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        ordstate: { name: "ordstate", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        agentcode: { name: "agentcod", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
    }
};

