/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

/**
 * Layouts (UX, "the feel"): https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
 * Themes (UI, "the look"): 
 *     https://3.7designs.co/blog/2017/12/using-design-adjectives-determine-look-feel/
 *     https://www.bopdesign.com/bop-blog/2013/11/what-is-the-look-and-feel-of-a-website-and-why-its-important/
 *     https://thenextweb.com/dd/2017/11/08/psychology-web-design/
 */

export enum FrmdbLy {
    spreadsheet = "frmdb-ly-spreadsheet",
    admin = "frmdb-ly-admin",
    cover = "frmdb-ly-cover",
    landing = "frmdb-ly-landing" ,
    carousel = "frmdb-ly-carousel",
    split = "frmdb-ly-split" ,
    fpattern = "frmdb-ly-fpattern",
    cards = "frmdb-ly-cards" ,
    grid = "frmdb-ly-grid" ,
    zpattern = "frmdb-ly-zpattern",
    zigzag = "frmdb-ly-zigzag",
    mosaic = "frmdb-ly-mosaic" ,
    magazine = "frmdb-ly-magazine",
    container_free = "frmdb-ly-container-free" ,
    horizontal_symetry = "frmdb-ly-horizontal-symetry",
    radial_symetry = "frmdb-ly-radial-symetry",
    asymetry = "frmdb-ly-asymetry",
}
export enum FrmdbLook {
    Friendly = 'Friendly',
    Approachable = 'Approachable',
    Professional = 'Professional',
    Experienced = 'Experienced',//similar to Professional
    Upscale = 'Upscale',//similar to Exclusive ?
    Exclusive = 'Exclusive',
    CuttingEdge = 'CuttingEdge',//similar to HighTech, but means new and shiny (and still with potential issues)
    Stylish = 'Stylish',
    HighTech = 'HighTech',
    Powerful = 'Powerful',
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

interface FullPage {
    brandName: string;
    logoUrl: string;
    layout: FrmdbLy;
    look: FrmdbLook,
    tbd1: string;
    tbd2: string;
    tbd3: string;
    tbd4: string;
    tbd5: string;
    tbd6: string;
    tbd7: string;
}

export type Layouts = FullPage['layout'];

export type Page = Partial<FullPage>;
