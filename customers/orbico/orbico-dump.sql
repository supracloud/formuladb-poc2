-- COPY (
create view trep__deliveryrate AS
    SELECT 
        'REP__DeliveryRate~~' || prlp.id as _id,
        ord.id as ordernb,
        ord.external_id as externalordernb,
        ord.created_at as ordercreationdate,
        GREATEST(prlp.updated_at, ord.updated_at) as ordermodificationdate,
        ord.client_code as clientcode,
        cln.name as client,
        ord.address_code as addresscode,
        ord.address as address,
        addr.name as addressname,
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
        INNER JOIN addresses addr ON ord.address_code = addr.code
        INNER JOIN clients cln ON ord.client_code = cln.code
    WHERE 
        prlp.quantity_error > 0
        AND prlp.created_at >= '2019-01-01' AND prlp.created_at < '2020-01-01'
;

-- ) TO '/home/sfa/bak/backups/delivery_report.csv';



-- COPY (
CREATE VIEW trep__orders AS
    SELECT 
        'REP__Orders~~' || ord.id as _id,
        ord.state as state,
        ord.product_list_id as product_list_id,
        ord.client_code as client_code,
        ord.actor_code as actor_code,
        ord.address_code as address_code,
        ord.address as address,
        addr.name as address_name,
        ord.city as city,
        ord.external_id as external_id,
        ord.external_param as external_param,
        ord.details as details,
        ord.created_at as created_at,
        ord.updated_at as updated_at,
        cln.name as client
    FROM
        orders ord
        INNER JOIN addresses addr ON ord.address_code = addr.code
        INNER JOIN clients cln ON ord.client_code = cln.code
    WHERE 
        ord.created_at >= '2019-01-01' AND ord.created_at < '2020-01-01'
;
-- ) TO '/home/sfa/bak/backups/orders.csv';

CREATE EXTENSION postgres_fdw;
CREATE SERVER old_sfa_server
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host 'localhost', port '5434', dbname 'sfa_production');
CREATE USER MAPPING FOR postgres
        SERVER old_sfa_server
        OPTIONS (user 'sy5t3m', password 'sy5t3m');
CREATE FOREIGN TABLE trep__deliveryrate_old_sfa (
 _id                text                        ,
 ordernb            integer                     ,
 externalordernb    character varying(255)      ,
 ordercreationdate  timestamp without time zone ,
 clientcode         character varying(255)      ,
 client             character varying(255)      ,
 addresscode        character varying(255)      ,
 address            character varying(255)      ,
 addressname        character varying(255)      ,
 group1             character varying(255)      ,
 group2             character varying(255)      ,
 group3             character varying(255)      ,
 group4             character varying(255)      ,
 location           character varying(255)      ,
 productcode        character varying(255)      ,
 barcode            character varying(255)      ,
 quantity           integer                     ,
 quantityerror      integer                     ,
 price              numeric(12,5)               ,
 product_name       character varying(255)      ,
 ordstate           character varying(255)      ,
 agentcode          character varying(255)      
)
        SERVER old_sfa_server
        OPTIONS (schema_name 'public', table_name 'trep__deliveryrate')
;
