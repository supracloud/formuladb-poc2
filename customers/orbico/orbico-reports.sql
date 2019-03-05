-- top 10 clients for errors
SELECT * FROM (
    SELECT 
        row_number() over() as _id,
        client,
        SUM(quantityerror) as total_errors
    FROM trep__deliveryrate
    GROUP BY client
) as tmp
ORDER BY total_errors DESC
LIMIT 10;

-- top 10 products for errors
SELECT * FROM (
    SELECT 
        row_number() over() as _id,
        barcode,
        SUM(quantityerror) as total_errors
    FROM trep__deliveryrate
    GROUP BY barcode
) as tmp
ORDER BY total_errors DESC
LIMIT 10;
