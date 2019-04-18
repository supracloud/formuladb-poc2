/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

/**
 * Layouts (UX, "the feel"): 
 *     https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
 *     https://uxplanet.org/z-shaped-pattern-for-reading-web-content-ce1135f92f1c
 * Themes (UI, "the look"): 
 *     https://3.7designs.co/blog/2017/12/using-design-adjectives-determine-look-feel/
 *     https://www.bopdesign.com/bop-blog/2013/11/what-is-the-look-and-feel-of-a-website-and-why-its-important/
 *     https://thenextweb.com/dd/2017/11/08/psychology-web-design/
 */

/** Auto-header styles */
export enum FrmdbHeader {
    hd_cover = "hd_cover",
    hd_jumbotron = "hd_jumbotron",
    hd_carousel = "hd_carousel",
    hd_split = "hd_split",
}

/** Auto-layout options */
export enum FrmdbLy {
    ly_admin = "ly_admin",
    ly_cards = "ly_cards",
    ly_fpattern = "ly_fpattern", //same as ly_cards just with a different style for the cards
    ly_zigzagpattern = "ly_zigzagpattern", //same as ly_cards just with a different style for the cards
    ly_grid = "ly_grid", //same as ly_cards just with a different style for the cards

    ly_landing = "ly_landing",
    ly_dashboard = "ly_dashboard",
    ly_spreadsheet = "ly_spreadsheet",
    ly_form = "ly_form", //same with ly_admin for Form pages

    ly_zpattern = "ly_zpattern",
    ly_mosaic = "ly_mosaic",
    ly_magazine = "ly_magazine",
    ly_container_free = "ly_container_free",
    ly_horizontal_symetry = "ly_horizontal_symetry",
    ly_radial_symetry = "ly_radial_symetry",
    ly_asymetry = "ly_asymetry",
    // Other layouts ?
    // - tabs
    // - wizard
}
export enum FrmdbLook {
    lk_Friendly = 'lk_Friendly',
    lk_Approachable = 'lk_Approachable',
    lk_Professional = 'lk_Professional',
    lk_Experienced = 'lk_Experienced',//similar to Professional
    lk_Upscale = 'lk_Upscale',//similar to Exclusive ?
    lk_Exclusive = 'lk_Exclusive',
    lk_CuttingEdge = 'lk_CuttingEdge',//similar to HighTech, but means new and shiny (and still with potential issues)
    lk_Stylish = 'lk_Stylish',
    lk_HighTech = 'lk_HighTech',
    lk_Powerful = 'lk_Powerful',
}

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
    colorPalette: string;
    sidebarOff?: boolean;
    sidebarImageUrl: string;    
    brandName: string;
    logoUrl: string;
    cssUrl: string | null;
    header?: FrmdbHeader;
    layout: FrmdbLy;
    look: FrmdbLook,
    // tbd1: string;
    // tbd2: string;
    // tbd3: string;
    // tbd4: string;
    // tbd5: string;
    // tbd6: string;
    // tbd7: string;
}

export type Layouts = Page['layout'];

