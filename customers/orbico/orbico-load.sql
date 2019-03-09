CREATE table delivery_report_import (
    _id varchar,
    ordernb varchar,
    externalordernb varchar,
    ordercreationdate varchar,
    clientcode varchar,
    client varchar,
    addresscode varchar,
    addressname varchar,
    group1 varchar,
    group2 varchar,
    group3 varchar,
    group4 varchar,
    location varchar,
    productcode varchar,
    barcode varchar,
    quantity integer,
    quantityerror integer,
    price varchar,
    product_name varchar,
    ordstate varchar,
    agentcode varchar
);

CREATE TABLE orders_input (
    _id varchar,
    state varchar,
    product_list_id varchar,
    client_code varchar,
    actor_code varchar,
    address_code varchar,
    address varchar,
    city varchar,
    external_id varchar,
    external_param varchar,
    details varchar,
    created_at varchar,
    updated_at varchar,
    client varchar
);

COPY orders_input FROM '/orders.csv';
insert into trep__orders select * from orders_input ;
COPY delivery_report_import FROM '/delivery_report.csv';

-- CREATE TABLE IF NOT EXISTS f_4320 (key VARCHAR NOT NULL PRIMARY KEY, val json);
-- CREATE TABLE IF NOT EXISTS f_2735 (key VARCHAR NOT NULL PRIMARY KEY, val json);


-- INSERT INTO f_4320 SELECT r._id as key, row_to_json(r) as val FROM (SELECT * FROM delivery_report_input) r;
-- INSERT INTO f_2735 SELECT r._id as key, row_to_json(r) as val FROM (SELECT * FROM orders_input) r;

-- --hack
-- create table f_2735_cols as select * from orders_input ;
