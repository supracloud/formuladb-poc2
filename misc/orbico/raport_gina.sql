COPY(
SELECT 
    o.id, o.external_id, o.created_at, o.client_code, 
    (select c.name from clients c where code = o.client_code) as client_name, 
    o.address_code, o.address,
    plp.inventory_code,
    plp.product_code,
    (select barcode from products p where p.code = plp.product_code) as barcode,
    plp.quantity,
    plp.quantity_error,
    plp.price
FROM orders o 
INNER JOIN product_list_products plp ON o.product_list_id = plp.product_list_id
WHERE o.created_at >= '2018-10-01' and o.client_code = 'CL00044'  and plp.quantity_error > 0
ORDER BY created_at desc
) TO '/home/sfa/bak/backups/dm_rata_livrare_Oct_2018.csv' DELIMITER ',' CSV HEADER;

select 
    client_code, 
    CASE
        WHEN client_code = 'CL00044' THEN 'DM DROGERIE MARKT SRL'
        WHEN client_code = 'CL00197' THEN 'AUCHAN ROMANIA SA'
        WHEN client_code = 'CL00103' THEN 'Douglas'
        WHEN client_code = 'CL00021' THEN 'ROMANIA-HYPERMARCHE'
        WHEN client_code = 'CL00321' THEN 'ROMANIA HYPERMARCH (Cora)'
        ELSE 'Alt client'
    END as client_name,
    name, 
    address, 
    edi_gln
FROM addresses 
WHERE edi_gln is null 
    AND client_code in ('CL00044', 'CL00197', 'CL00103', 'CL00021', 'CL00321');
;
