// https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
interface FullPage {
    brandName: string;
    logoUrl: string;
    layout: "frmdb-ly-admin" | "frmdb-ly-cover" | "frmdb-ly-landing" 
        | "frmdb-ly-lading-slim-header" | "frmdb-ly-carousel" | "frmdb-ly-split" 
        | "frmdb-ly-fpattern" | "frmdb-ly-zpattern" | "frmdb-ly-mosaic" 
        | "frmdb-ly-magazine" | "frmdb-ly-container-free" 
        | "frmdb-ly-horizontal-symetry" | "frmdb-ly-radial-symetry" | "frmdb-ly-asymetry" ;
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
