-- top 10 clients for errors
insert into trep__topcust
SELECT * FROM (
    SELECT 
        row_number() over() as _id,
        client,
        SUM(quantityerror) as total_errors
    FROM trep__deliveryrate
    GROUP BY client
) as tmp
ORDER BY total_errors DESC
LIMIT 20;

-- top 10 products for errors
insert into trep__topprod
SELECT * FROM (
    SELECT 
        row_number() over() as _id,
        barcode,
        SUM(quantityerror) as total_errors
    FROM trep__deliveryrate
    GROUP BY barcode
) as tmp
ORDER BY total_errors DESC
LIMIT 20;
