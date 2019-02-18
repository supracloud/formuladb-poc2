import { INV__PRD__Location9a, INV__PRD__Location10, Prd_9a, Prd_10, INV__PRD__Location11, INV__PRD__Location12, Prd_11, Prd_12 } from "./inventory-data";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export const ord5 = { _id: "INV__Order~~5", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord5p1 = { _id: "INV__Order__Item~~5__1", product_id: INV__PRD__Location9a._id, quantity: 70 };
export const ord5p2 = { _id: "INV__Order__Item~~5__2", product_id: INV__PRD__Location10._id, quantity: 80 };
export const ord5p3 = { _id: "INV__Order__Item~~5__3", product_id: INV__PRD__Location11._id, quantity: 90 };
export const ord5p4 = { _id: "INV__Order__Item~~5__4", product_id: INV__PRD__Location12._id, quantity: 100 };
export const ord6 = { _id: "INV__Order~~6", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord6p1 = { _id: "INV__Order__Item~~6__1", product_id: INV__PRD__Location9a._id, quantity: 50 };
export const ord6p2 = { _id: "INV__Order__Item~~6__2", product_id: INV__PRD__Location10._id, quantity: 60 };
export const ord6p3 = { _id: "INV__Order__Item~~6__3", product_id: INV__PRD__Location11._id, quantity: 70 };
export const ord6p4 = { _id: "INV__Order__Item~~6__4", product_id: INV__PRD__Location12._id, quantity: 80 };

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
];
