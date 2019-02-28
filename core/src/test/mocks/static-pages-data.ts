import { NodeType } from "@core/domain/uimetadata/form";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


 
export const StaticPagesData = [
    {_id: 'StaticPage~~home', name: "home"},
    {_id: 'StaticPageElement~~home__title', type: NodeType.form_text},
    {_id: 'StaticPageElement~~home__tagline', type: NodeType.form_text},
    {_id: 'StaticPageElement~~home__features', type: NodeType.list},
    {_id: 'StaticPageElement~~home__features__1', type: NodeType.card},
    {_id: 'StaticPageElement~~home__features__1__icon', type: NodeType.icon},
    {_id: 'StaticPageElement~~home__features__1__name', type: NodeType.icon},
    {_id: 'StaticPageElement~~home__features__1__description', type: NodeType.icon},
    {_id: 'StaticPage~~dashboard', name: "dashboard"},
    {_id: 'StaticPageElement~~dashboard__stats', type: NodeType.list},
    {_id: 'StaticPageElement~~dashboard__stats__1', type: NodeType.card},
    {_id: 'StaticPageElement~~dashboard__stats__1__name', type: NodeType.form_text},
];
