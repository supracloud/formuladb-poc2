/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, EntityStateGraph, Schema } from "@domain/metadata/entity";
import { App } from "@domain/app";

export const SampleApp = {
    _id: "SampleApp",
    isEditable: false,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        wish_list_count: { name: "wish_list_count", propType_: Pn.FORMULA, formula: "COUNTIF(WishListRequest, app == @[_id])" } as EntityProperty,
        category: { name: "category", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        category_2: { name: "category_2", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        theme_url: { name: "theme_url", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        short_description:  { name: "short_description", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        small_img: { name: "small_img", propType_: Pn.IMAGE, allowNull: false } as EntityProperty,
        long_img: { name: "long_img", propType_: Pn.IMAGE, allowNull: false } as EntityProperty,
    }
};

export const WishListRequest = {
    _id: "WishListRequest",
    isEditable: false,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        app: { name: "app", propType_: Pn.REFERENCE_TO, referencedEntityName: SampleApp._id, referencedPropertyName: SampleApp.props._id.name } as EntityProperty,
        email: { name: "email", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        comments: { name: "comments", propType_: Pn.STRING } as EntityProperty,
    }
};

export const FormuladbIoApp: App = {
    _id: "/formuladb-internal/formuladb.io",
    description: "formuladb.io",
    theme: "portal/public",
    pages: [
        { name: "index.html", title: "FormulaDB" },
        { name: "no_code.html", title: "FormulaDB" },
        { name: "low_code.html", title: "FormulaDB" },
        { name: "pricing.html", title: "FormulaDB" },
        { name: "add__WishListRequest.html", title: "" },
    ],
};

export const FormuladbIoSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~' + FormuladbIoApp._id,
    entities: {
        [SampleApp._id]: SampleApp,
        [WishListRequest._id]: WishListRequest,
    },
}
