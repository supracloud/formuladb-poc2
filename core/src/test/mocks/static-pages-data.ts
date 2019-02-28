import { NodeType } from "@core/domain/uimetadata/form";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


 
export const StaticPagesData = [
    {_id: 'StaticPage~~home', name: "home"},
    {_id: 'StaticPageElement~~home__title', type: NodeType.form_text, value: "FormulaDB"},
    {_id: 'StaticPageElement~~home__tagline', type: NodeType.form_text, value: "Build apps and websites instantly, spreadsheet-like formulas, templates"},
    {_id: 'StaticPageElement~~home__features', type: NodeType.list},
    {_id: 'StaticPageElement~~home__features__1', type: NodeType.card},
    {_id: 'StaticPageElement~~home__features__1__icon', type: NodeType.icon, value: "App Website Templates"},
    {_id: 'StaticPageElement~~home__features__1__name', type: NodeType.icon, value: "App/Website Templates"},
    {_id: 'StaticPageElement~~home__features__1__description', type: NodeType.icon, value: "A few clicks to create an app/website matching your brand, just choose: template, sentiment, color palette, logo and artwork."},
    {_id: 'StaticPageElement~~home__features__2', type: NodeType.card},
    {_id: 'StaticPageElement~~home__features__2__icon', type: NodeType.icon, value: "Fables Formulas"},
    {_id: 'StaticPageElement~~home__features__2__name', type: NodeType.icon, value: "Tables and Formulas"},
    {_id: 'StaticPageElement~~home__features__2__description', type: NodeType.icon, value: "Easily to manage your data: just tables and formulas. Get started instantly with our ready to use examples."},
    {_id: 'StaticPageElement~~home__features__3', type: NodeType.card},
    {_id: 'StaticPageElement~~home__features__3__icon', type: NodeType.icon, value: "Forms Charts Calendar Gallery Tables etc."},
    {_id: 'StaticPageElement~~home__features__3__name', type: NodeType.icon, value: "Forms Charts Calendar Gallery Tables etc."},
    {_id: 'StaticPageElement~~home__features__3__description', type: NodeType.icon, value: "Customize the user experience for each user role and table"},
    {_id: 'StaticPageElement~~home__features__4', type: NodeType.card},
    {_id: 'StaticPageElement~~home__features__4__icon', type: NodeType.icon, value: "users roles workflows permissions security "},
    {_id: 'StaticPageElement~~home__features__4__name', type: NodeType.icon, value: "Users, Roles, Workflows, Permisssions, Security"},
    {_id: 'StaticPageElement~~home__features__4__description', type: NodeType.icon, value: "Easily enforce custom workflows, just define user roles and sequence of table operations each role must perform."},
    {_id: 'StaticPage~~dashboard', name: "dashboard"},
    {_id: 'StaticPageElement~~dashboard__stats', type: NodeType.list},
    {_id: 'StaticPageElement~~dashboard__stats__1', type: NodeType.card},
    {_id: 'StaticPageElement~~dashboard__stats__1__name', type: NodeType.form_text},
];
