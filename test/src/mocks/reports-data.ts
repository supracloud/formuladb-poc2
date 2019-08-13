import { ProductLocation9a, ProductLocation10, Prd_9a, Prd_10, ProductLocation11, ProductLocation12, Prd_11, Prd_12 } from "../inventory/data";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export const ord5 = { _id: "InventoryOrder~~5", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord5p1 = { _id: "OrderItem~~5__1", product_id: ProductLocation9a._id, quantity: 70 };
export const ord5p2 = { _id: "OrderItem~~5__2", product_id: ProductLocation10._id, quantity: 80 };
export const ord5p3 = { _id: "OrderItem~~5__3", product_id: ProductLocation11._id, quantity: 90 };
export const ord5p4 = { _id: "OrderItem~~5__4", product_id: ProductLocation12._id, quantity: 100 };
export const ord6 = { _id: "InventoryOrder~~6", sales_agent: "John Doe", creation_date: "2018-09-27" };
export const ord6p1 = { _id: "OrderItem~~6__1", product_id: ProductLocation9a._id, quantity: 50 };
export const ord6p2 = { _id: "OrderItem~~6__2", product_id: ProductLocation10._id, quantity: 60 };
export const ord6p3 = { _id: "OrderItem~~6__3", product_id: ProductLocation11._id, quantity: 70 };
export const ord6p4 = { _id: "OrderItem~~6__4", product_id: ProductLocation12._id, quantity: 80 };

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
