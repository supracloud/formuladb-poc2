/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, EntityStateGraph, Schema } from "@domain/metadata/entity";
import { App } from "@domain/app";
import { $User, $Dictionary } from "@domain/metadata/default-metadata";

export const AppCategory = {
    _id: "AppCategory",
    isEditable: false,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};

export const SampleApp = {
    _id: "SampleApp",
    isEditable: false,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        name: { name: "name", propType_: Pn.FORMULA, formula: "REGEXREPLACE(_id, \"SampleApp~~[0-9]+ \", \"\")" } as EntityProperty,
        category: { name: "category", propType_: Pn.REFERENCE_TO, referencedEntityName: AppCategory._id, referencedPropertyName: AppCategory.props._id.name } as EntityProperty,
        category2: { name: "category2", propType_: Pn.REFERENCE_TO, referencedEntityName: AppCategory._id, referencedPropertyName: AppCategory.props._id.name } as EntityProperty,
        categories: { name: "categories", propType_: Pn.FORMULA, formula: "CONCATENATE(category, category2)" } as EntityProperty,
        app_url: { name: "app_url", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        short_description:  { name: "short_description", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        wish_list_count: { name: "wish_list_count", propType_: Pn.FORMULA, formula: "COUNTIF(WishListRequest._id, app == @[_id])" } as EntityProperty,
        status: { name: "status", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        call_to_action: { name: "call_to_action", propType_: Pn.STRING, allowNull: false } as EntityProperty,
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

export const ContactRequest = {
    _id: "ContactRequest",
    isEditable: false,
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        email: { name: "email", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        comments: { name: "comments", propType_: Pn.STRING } as EntityProperty,
    }
};

export const FormuladbIoApp: App = {
    _id: "formuladb.io",
    description: "formuladb.io",
    pages: [
        "index.html",
        "no-code.html",
        "low-code.html",
        "no-code-vs-low-code.html",
        "pricing.html",
        "contact.html",
        "community.html",
        "about.html",
        "add__WishListRequest.html",
        "_nav.html",
        "_footer.html",
    ],
};

export const FormuladbIoSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~formuladb-internal--' + FormuladbIoApp._id,
    entities: {
        [SampleApp._id]: SampleApp,
        [WishListRequest._id]: WishListRequest,
        [AppCategory._id]: AppCategory,
        [ContactRequest._id]: ContactRequest,
        [$User._id]: $User,
        [$Dictionary._id]: $Dictionary,
    },
}
