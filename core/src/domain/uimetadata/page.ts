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

interface FullPage {
    brandName: string;
    logoUrl: string;
    layout: "frmdb-ly-admin" | "frmdb-ly-cover" | "frmdb-ly-landing" 
        | "frmdb-ly-lading-slim-header" | "frmdb-ly-carousel" | "frmdb-ly-split" 
        | "frmdb-ly-fpattern" | "frmdb-ly-zpattern" | "frmdb-ly-mosaic" 
        | "frmdb-ly-magazine" | "frmdb-ly-container-free" 
        | "frmdb-ly-horizontal-symetry" | "frmdb-ly-radial-symetry" | "frmdb-ly-asymetry";
    look: 'Friendly' | 'Approachable' | 'Professional'
        | 'Experienced' | 'Upscale' | 'Exclusive'
        | 'Cutting edge' | 'Stylish' | 'High-tech' | 'Powerful',
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
