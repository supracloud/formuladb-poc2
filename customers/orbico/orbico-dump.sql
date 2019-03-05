COPY (
    SELECT 
        prlp.id as _id,
        ord.id as ordernb,
        ord.external_id as externalordernb,
        ord.created_at as ordercreationdate,
        ord.client_code as clientcode,
        cln.name as client,
        ord.address_code as addresscode,
        ord.address as addressname,
        pr.group1 as group1,
        pr.group2 as group2,
        pr.group3 as group3,
        pr.group4 as group4,
        prlp.inventory_code as location,
        prlp.product_code as productcode,
        pr.barcode as barcode,
        prlp.quantity as quantity,
        prlp.quantity_error as quantityerror,
        pr.price as price,
        pr.name as product_name,
        ord.state as ordstate,
        ord.actor_code as agentcode
    FROM
        product_list_products prlp
        INNER JOIN products pr ON prlp.product_code = pr.code
        INNER JOIN orders ord ON prlp.product_list_id = ord.product_list_id
        INNER JOIN clients cln ON ord.client_code = cln.code
    WHERE 
        prlp.quantity_error > 0
        AND prlp.created_at > '2018-01-01'
) TO '/home/sfa/bak/backups/delivery_report.csv';



COPY (
    SELECT 
        ord.id as _id,
        ord.state as state,
        ord.product_list_id as product_list_id,
        ord.client_code as client_code,
        ord.actor_code as actor_code,
        ord.address_code as address_code,
        ord.address as address,
        ord.city as city,
        ord.external_id as external_id,
        ord.external_param as external_param,
        ord.details as details,
        ord.created_at as created_at,
        ord.updated_at as updated_at,
        cln.name as client
    FROM
        orders ord
        INNER JOIN clients cln ON ord.client_code = cln.code
    WHERE 
        ord.created_at > '2018-01-01'
) TO '/home/sfa/bak/backups/orders.csv';
