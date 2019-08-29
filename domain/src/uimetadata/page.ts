import { NodeElement, RootNode } from "./node-elements";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

/**
 * Layouts (UX, "the feel"): 
 *     https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
 *     https://www.smashingmagazine.com/2015/06/design-principles-compositional-balance-symmetry-asymmetry/
 *     https://uxplanet.org/z-shaped-pattern-for-reading-web-content-ce1135f92f1c
 * Themes (UI, "the look"): 
 *     https://3.7designs.co/blog/2017/12/using-design-adjectives-determine-look-feel/
 *     https://www.bopdesign.com/bop-blog/2013/11/what-is-the-look-and-feel-of-a-website-and-why-its-important/
 *     https://thenextweb.com/dd/2017/11/08/psychology-web-design/
 */

/**
 * Interesting stuff:
 * http://leonidas.github.io/transparency/ -> Valid HTML templating engine
 * https://github.com/givanz/VvvebJs -> bootstrap HTML visual builder
 * https://github.com/dgraham/delegated-events: configure events globally
 */

/** Auto-header styles */
export const FrmdbHeader = [
    "frmdb-hd-cover",
    "frmdb-hd-jumbotron",
    "frmdb-hd-carousel",
    "frmdb-hd-split",
    "frmdb-hd-none",
];

/** Auto-layout options */
export const FrmdbLy = [
    "frmdb-ly-admin",
    "frmdb-ly-cards",
    "frmdb-ly-fpattern", //same as frmdb-ly-cards just with a different style for the cards
    "frmdb-ly-zigzagpattern", //same as frmdb-ly-cards just with a different style for the cards
    "frmdb-ly-grid", //same as frmdb-ly-cards just with a different style for the cards
    "frmdb-ly-landing",
    "frmdb-ly-dashboard",
    "frmdb-ly-spreadsheet",
    "frmdb-ly-form", //same with frmdb-ly-admin for FormPage pages
    "frmdb-ly-zpattern",
    "frmdb-ly-mosaic",
    "frmdb-ly-magazine",
    "frmdb-ly-container_free",
    "frmdb-ly-horizontal_symetry",
    "frmdb-ly-radial_symetry",
    "frmdb-ly-asymetry",
    // Other layouts ?
    // - tabs
    // - wizard
];
export const FrmdbLook = [
    "frmdb-lk-friendly",
    "frmdb-lk-approachable",
    "frmdb-lk-professional",
    "frmdb-lk-experienced",//similar to Professional
    "frmdb-lk-upscale",//similar to Exclusive ?
    "frmdb-lk-exclusive",
    "frmdb-lk-cuttingEdge",//similar to HighTech, but means new and shiny (and still with potential issues)
    "frmdb-lk-stylish",
    "frmdb-lk-highTech",
    "frmdb-lk-powerful",
];

export const BrandCharacteristics = [
    {left: "Conservative", right: "Progressive"},
    {left: "Warm", right: "Cold"},
    {left: "Fun", right: "Serious"},
    {left: "Casual", right: "Formal"},
    {left: "Energetic", right: "LaidBack"},
    {left: "Trendy", right: "Classic"},
    {left: "Spontaneous", right: "Orderly"},
    {left: "Solitary", right: "Popular"},
    {left: "Unique", right: "Familiar"},
    {left: "Young", right: "Old"},
];

export interface Page {
    _id: string;
    html: string;
}

export interface _old_Page extends RootNode {
    _id: string;
    childNodes?: NodeElement[];

    colorPalette?: string;
    sidebarImageUrl?: string;    
    brandName?: string;
    logoUrl?: string;
    cssUrl?: string | null;
    topNavLook?: "tn_nav" | "tn_slim";
    sideNavLook?: "sn_nav" | "sn_none";
    footerLook?: "ft_nav" | "ft_none";
    header?: | "frmdb-hd-cover"| "frmdb-hd-jumbotron"| "frmdb-hd-carousel"| "frmdb-hd-split"| "frmdb-hd-none" ;
    layout?: | "frmdb-ly-admin"| "frmdb-ly-cards"| "frmdb-ly-fpattern"| "frmdb-ly-zigzagpattern"| "frmdb-ly-grid"| "frmdb-ly-landing"| "frmdb-ly-dashboard"| "frmdb-ly-spreadsheet"| "frmdb-ly-form"| "frmdb-ly-zpattern"| "frmdb-ly-mosaic"| "frmdb-ly-magazine"| "frmdb-ly-container_free"| "frmdb-ly-horizontal_symetry"| "frmdb-ly-radial_symetry"| "frmdb-ly-asymetry";
    look?: | "frmdb-lk-friendly"| "frmdb-lk-approachable"| "frmdb-lk-professional"| "frmdb-lk-experienced"| "frmdb-lk-upscale"| "frmdb-lk-exclusive"| "frmdb-lk-cuttingEdge"| "frmdb-lk-stylish"| "frmdb-lk-highTech"| "frmdb-lk-powerful";
    // tbd1: string;
    // tbd2: string;
    // tbd3: string;
    // tbd4: string;
    // tbd5: string;
    // tbd6: string;
    // tbd7: string;
}

export type FrmdbLayoutType = Exclude<_old_Page['layout'], undefined>;
export type FrmdbHeaderType = Exclude<_old_Page['header'], undefined>;
