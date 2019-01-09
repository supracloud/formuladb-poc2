import { INV___PRD___Location9a, INV___PRD___Location10, Prd_9a, Prd_10, INV___PRD___Location11, INV___PRD___Location12, Prd_11, Prd_12 } from "./inventory-data";

/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

export const ord5 = { _id: "INV___Order~~5", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord5p1 = { _id: "INV___Order___Item~~5___1", productLocationId: INV___PRD___Location9a._id, quantity: 70 };
export const ord5p2 = { _id: "INV___Order___Item~~5___2", productLocationId: INV___PRD___Location10._id, quantity: 80 };
export const ord5p3 = { _id: "INV___Order___Item~~5___3", productLocationId: INV___PRD___Location11._id, quantity: 90 };
export const ord5p4 = { _id: "INV___Order___Item~~5___4", productLocationId: INV___PRD___Location12._id, quantity: 100 };
export const ord6 = { _id: "INV___Order~~6", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord6p1 = { _id: "INV___Order___Item~~6___1", productLocationId: INV___PRD___Location9a._id, quantity: 50 };
export const ord6p2 = { _id: "INV___Order___Item~~6___2", productLocationId: INV___PRD___Location10._id, quantity: 60 };
export const ord6p3 = { _id: "INV___Order___Item~~6___3", productLocationId: INV___PRD___Location11._id, quantity: 70 };
export const ord6p4 = { _id: "INV___Order___Item~~6___4", productLocationId: INV___PRD___Location12._id, quantity: 80 };
export const largeSalesReport1 = { _id: 'REP___LargeSales~~1', client: "John Doe", month: "2018-09-01"};
export const largeSalesReport1p1 = { _id: 'REP___LargeSales___Product~~1___1', productLocationId: INV___PRD___Location9a._id, productName: Prd_9a.name, largeSalesValue: 120};
export const largeSalesReport1p2 = { _id: 'REP___LargeSales___Product~~1___2', productLocationId: INV___PRD___Location10._id, productName: Prd_10.name, largeSalesValue: 140};
export const largeSalesReport1p3 = { _id: 'REP___LargeSales___Product~~1___3', productLocationId: INV___PRD___Location11._id, productName: Prd_11.name, largeSalesValue: 160};
export const largeSalesReport1p4 = { _id: 'REP___LargeSales___Product~~1___4', productLocationId: INV___PRD___Location12._id, productName: Prd_12.name, largeSalesValue: 180};

export const ReportsData = [
    ord5,
    ord5p1,
    ord5p2,
    ord5p3,
    ord5p4,
    ord6,
    ord6p1,
    ord6p2,
    ord6p3,
    ord6p4,
    largeSalesReport1,
    largeSalesReport1p1,
    largeSalesReport1p2,
    largeSalesReport1p3,
    largeSalesReport1p4,
];
