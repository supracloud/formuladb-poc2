import { INV__PRD__Location9a, INV__PRD__Location10, Prd_9a, Prd_10, INV__PRD__Location11, INV__PRD__Location12, Prd_11, Prd_12 } from "./inventory-data";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export const ord5 = { _id: "INV__Order~~5", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord5p1 = { _id: "INV__Order__Item~~5__1", productLocationId: INV__PRD__Location9a._id, quantity: 70 };
export const ord5p2 = { _id: "INV__Order__Item~~5__2", productLocationId: INV__PRD__Location10._id, quantity: 80 };
export const ord5p3 = { _id: "INV__Order__Item~~5__3", productLocationId: INV__PRD__Location11._id, quantity: 90 };
export const ord5p4 = { _id: "INV__Order__Item~~5__4", productLocationId: INV__PRD__Location12._id, quantity: 100 };
export const ord6 = { _id: "INV__Order~~6", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord6p1 = { _id: "INV__Order__Item~~6__1", productLocationId: INV__PRD__Location9a._id, quantity: 50 };
export const ord6p2 = { _id: "INV__Order__Item~~6__2", productLocationId: INV__PRD__Location10._id, quantity: 60 };
export const ord6p3 = { _id: "INV__Order__Item~~6__3", productLocationId: INV__PRD__Location11._id, quantity: 70 };
export const ord6p4 = { _id: "INV__Order__Item~~6__4", productLocationId: INV__PRD__Location12._id, quantity: 80 };
export const largeSalesReport1 = { _id: 'REP__LargeSales~~1', client: "John Doe", month: "2018-09-01"};
export const largeSalesReport1p1 = { _id: 'REP__LargeSales__Product~~1__1', productLocationId: INV__PRD__Location9a._id, productName: Prd_9a.name, largeSalesValue: 120};
export const largeSalesReport1p2 = { _id: 'REP__LargeSales__Product~~1__2', productLocationId: INV__PRD__Location10._id, productName: Prd_10.name, largeSalesValue: 140};
export const largeSalesReport1p3 = { _id: 'REP__LargeSales__Product~~1__3', productLocationId: INV__PRD__Location11._id, productName: Prd_11.name, largeSalesValue: 160};
export const largeSalesReport1p4 = { _id: 'REP__LargeSales__Product~~1__4', productLocationId: INV__PRD__Location12._id, productName: Prd_12.name, largeSalesValue: 180};

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
