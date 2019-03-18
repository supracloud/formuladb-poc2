// https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
interface FullPage {
    brandName: string;
    logoUrl: string;
    layout: "frmdb-ly-admin" | "frmdb-ly-cover" | "frmdb-ly-large-header" 
         | "frmdb-ly-slim-header" | "frmdb-ly-slim-carousel" | "frmdb-ly-split" 
         | "frmdb-ly-fpattern" | "frmdb-ly-zpattern" | "frmdb-ly-mosaic" 
         | "frmdb-ly-magazine" | "frmdb-ly-container-free";
    tbd1: string;
    tbd2: string;
    tbd3: string;
    tbd4: string;
    tbd5: string;
    tbd6: string;
    tbd7: string;
}

export type Page = Partial<FullPage>;
