// https://www.uxpin.com/studio/blog/web-layout-best-practices-12-timeless-ui-patterns-explained/
interface FullPage {
    brandName: string;
    logoUrl: string; 
    layout: "frmdb-ly-dashboard" | "frmdb-ly-landing";
    secondaryNavPosition: "bottom" | "right";
    tbd1: string;
    tbd2: string;
    tbd3: string;
    tbd4: string;
    tbd5: string;
    tbd6: string;
    tbd7: string;
}

export type Page = Partial<FullPage>;
