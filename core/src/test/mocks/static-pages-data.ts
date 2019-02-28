import { NodeType } from "@core/domain/uimetadata/form";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */
 
export const StaticPagesData = [
    {_id: 'StaticPage~~home', name: "home"},
    {_id: 'StaticPageElement~~home__title', formuladb_widget_type: NodeType.form_text, value: "FormulaDB"},
    {_id: 'StaticPageElement~~home__tagline', formuladb_widget_type: NodeType.form_text, value: "Build apps and websites instantly, spreadsheet-like formulas, templates"},
    {_id: 'StaticPageElement~~home__features', formuladb_widget_type: NodeType.list},
    {_id: 'StaticPageSubElement~~home__features__1', formuladb_widget_type: NodeType.card},
    {_id: 'StaticPageThirdLevelElement~~home__features__1__icon', formuladb_widget_type: NodeType.icon, value: "App Website Templates"},
    {_id: 'StaticPageThirdLevelElement~~home__features__1__name', formuladb_widget_type: NodeType.icon, value: "App/Website Templates"},
    {_id: 'StaticPageThirdLevelElement~~home__features__1__description', formuladb_widget_type: NodeType.icon, value: "A few clicks to create an app/website matching your brand, just choose: template, sentiment, color palette, logo and artwork."},
    {_id: 'StaticPageSubElement~~home__features__2', formuladb_widget_type: NodeType.card},
    {_id: 'StaticPageThirdLevelElement~~home__features__2__icon', formuladb_widget_type: NodeType.icon, value: "Fables Formulas"},
    {_id: 'StaticPageThirdLevelElement~~home__features__2__name', formuladb_widget_type: NodeType.icon, value: "Tables and Formulas"},
    {_id: 'StaticPageThirdLevelElement~~home__features__2__description', formuladb_widget_type: NodeType.icon, value: "Easily to manage your data: just tables and formulas. Get started instantly with our ready to use examples."},
    {_id: 'StaticPageSubElement~~home__features__3', formuladb_widget_type: NodeType.card},
    {_id: 'StaticPageThirdLevelElement~~home__features__3__icon', formuladb_widget_type: NodeType.icon, value: "Forms Charts Calendar Gallery Tables etc."},
    {_id: 'StaticPageThirdLevelElement~~home__features__3__name', formuladb_widget_type: NodeType.icon, value: "Forms Charts Calendar Gallery Tables etc."},
    {_id: 'StaticPageThirdLevelElement~~home__features__3__description', formuladb_widget_type: NodeType.icon, value: "Customize the user experience for each user role and table"},
    {_id: 'StaticPageSubElement~~home__features__4', formuladb_widget_type: NodeType.card},
    {_id: 'StaticPageThirdLevelElement~~home__features__4__icon', formuladb_widget_type: NodeType.icon, value: "users roles workflows permissions security "},
    {_id: 'StaticPageThirdLevelElement~~home__features__4__name', formuladb_widget_type: NodeType.icon, value: "Users, Roles, Workflows, Permisssions, Security"},
    {_id: 'StaticPageThirdLevelElement~~home__features__4__description', formuladb_widget_type: NodeType.icon, value: "Easily enforce custom workflows, just define user roles and sequence of table operations each role must perform."},
    {_id: 'StaticPage~~dashboard', name: "dashboard"},
    {_id: 'StaticPageElement~~dashboard__stats', formuladb_widget_type: NodeType.list},
    {_id: 'StaticPageSubElement~~dashboard__stats__1', formuladb_widget_type: NodeType.card},
    {_id: 'StaticPageThirdLevelElement~~dashboard__stats__1__name', formuladb_widget_type: NodeType.form_text},
];
