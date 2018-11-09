# Migration

```sql
CREATE TABLE product_list_products (
    id integer NOT NULL,
    product_list_id integer NOT NULL,
    _sy5_index double precision,
    inventory_code character varying(255) DEFAULT 'DEFAULT'::character varying NOT NULL,
    product_code character varying(255) NOT NULL,
    quantity integer NOT NULL,
    quantity_error integer,
    quantity_delta integer,
    quantity_del integer,
    client_stock integer,
    name character varying(255),
    price numeric(12,5),
    currency_code character varying(3),
    state character varying(255) DEFAULT 'ACTIVE_'::character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);
ALTER TABLE ONLY product_list_products ADD CONSTRAINT product_list_products_pkey PRIMARY KEY (id);

CREATE TABLE product_list_products_json (
    id integer NOT NULL,
    data json NOT NULL
);

ALTER TABLE ONLY product_list_products_json ADD CONSTRAINT product_list_products_json_pkey PRIMARY KEY (id);

```

I really like CouchDB's philosophy of immutability, pure functional incremental map-reduce views, multi-master replication with custom conflict management, changes feed, PouchDB-sync. I think it fits well with many things happening in back-end development nowadays: pure functional, reactive, event sourcing, CQRS, stream-processing, etc. I would like to use Couch+Pouch in one of my projects but I need some help with tuning the single node write performance of CouchDB vs Postgresql.

I just did some simple and quick tests that showed that the write performance of Postgres is much higher than CouchDB:

bulk import time for ~4.7mil records: 49sec vs 14min
insert one record at a time: ~800 records/sec vs ~130 records/sec
Can anyone with good CouchDB tuning experience advise on what am I doing wrong OR how can I increase the throughput on CouchDB? Please see below the details. The data is exactly the same, just that the Postgres primary key is a number while in CouchDB the _id is the string representation of that number.

It is clear that HTTP has an overhead for CouchDB, but still, the difference seems too big.

# Postgresql

```bash
MSYS2_ARG_CONV_EXCL="*" docker run -v $(pwd)/../ep-data:/data --name ep -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d clkao/postgres-plv8

#Dump data from postgres
docker exec -it ep bash -c 'echo "create database sy5t3m;" | psql -U postgres'
time docker exec -it ep bash -c 'cat /data/sfa_production.20181024010001.sql | psql -U postgres -d sy5t3m'
docker exec -it ep bash -c "echo -e \"\o /data/actors.json\nselect row_to_json(r) from (select 'General___Actor~~' || id as _id, code, username, name, role from actors) r;\" | psql -U postgres -d sy5t3m"
# docker exec -it ep bash -c "echo -e \"\o /data/actors.json\nselect row_to_json(r) from (select 'Inventory___Order___Item~~' || id as _id, * from product_list_products) r;\" | psql -U postgres -d sy5t3m"
docker exec -it ep bash -c "echo \"COPY (select row_to_json(r) from (select 'Inventory___Order___Item~~' || id as _id, * from product_list_products) r) to '/data/order_items.csv'  With CSV DELIMITER ',';\" | psql -U postgres -d sy5t3m"

        time docker exec -it ep bash -c "echo \"COPY product_list_products to '/data/product_list_products.csv'  With CSV DELIMITER ',';\" | psql -U postgres -d sy5t3m"
        COPY 4714978
        real    0m28.764s
        user    0m0.000s
        sys     0m0.078s

#load data into postgres
docker exec -it ep psql -U postgres -d sy5t3m #then create table product_list_products using the SQL above
time docker exec -it ep bash -c "echo \"COPY product_list_products from '/data/product_list_products.csv'  With CSV DELIMITER ',';\" | psql -U postgres -d sy5t3m"
COPY 4714978
real    0m25.589s
user    0m0.000s
sys     0m0.078s
docker exec -it ep bash -c "echo \"select count(*) from product_list_products;\" | psql -U postgres -d sy5t3m"
docker exec -it ep bash -c "echo \"select count(*) from product_list_products_json;\" | psql -U postgres -d sy5t3m"
  count
---------
 4811899
(1 row)

time docker exec -it ep bash -c "echo \"select * from product_list_products where product_code = '2084081435509' limit 1;\" | psql -U postgres -d sy5t3m"
time docker exec -it ep bash -c "echo \"select * from product_list_products where product_code = '2084081435509';\" | psql -U postgres -d sy5t3m"
time docker exec -it ep bash -c "echo \"select * from product_list_products_json where data ->> 'product_code' = '2084081279058' limit 1;\" | psql -U postgres -d sy5t3m"

docker exec -it ep bash
```

# CouchDB

```bash

#docker run -d -v $(pwd)/../ec-data:/opt/couchdb/data -p 5984:5984 --name ec couchdb
docker run -d -p 5984:5984 --name ec couchdb
curl -X PUT http://127.0.0.1:5984/evrt
curl -d @../ep-data/actors.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/evrt/_bulk_docs

#4mil rows cannot work with only one curl call
sed -i 's/_sy5/sy5/' order_items.json
split -l 5000 -d order_items.json
sed -i 's/[}]$/},/; $ s/,$/]}/; 1 s/^/{"docs": [/' x*
for i in x*; do (echo '{"docs": ['; cat $i ) > _tmp.json && sed -i '$ s/,$/]}/' _tmp.json && mv _tmp.json $i; done
time for i in x*; do time curl -T ${i} -H "Content-type: application/json" -X POST http://127.0.0.1:5984/evrt/_bulk_docs | grep -v '"ok":true'; done

curl -H "Content-type: application/json" -X POST http://127.0.0.1:5984/evrt/_find -d '{
   "selector": {
      "_id": {
         "$regex": "^Inventory"
      }
   },
   "limit": 1,
   "execution_stats": true
}'

time (echo "_id,product_list_id,sy5_index,inventory_code,product_code,quantity,quantity_error,quantity_delta,quantity_del,client_stock,name,price,currency_code,state,created_at,updated_at"; cat product_list_products.csv) | couchimport --delimiter "," -u http://127.0.0.1:5984 -d evrt --parallelism 4 -b 5000

 . . . . . . . . . . . . .

  couchimport { documents: 5000, failed: 0, total: 4690000, totalfailed: 0 } +1s
  couchimport Written ok:5000 - failed: 0 -  (4695000) +1s
  couchimport { documents: 5000, failed: 0, total: 4695000, totalfailed: 0 } +1s
  couchimport Written ok:5000 - failed: 0 -  (4700000) +1s
  couchimport { documents: 5000, failed: 0, total: 4700000, totalfailed: 0 } +1s
  couchimport Written ok:5000 - failed: 0 -  (4705000) +2s
  couchimport { documents: 5000, failed: 0, total: 4705000, totalfailed: 0 } +2s
  couchimport Written ok:5000 - failed: 0 -  (4710000) +1s
  couchimport { documents: 5000, failed: 0, total: 4710000, totalfailed: 0 } +1s
  couchimport Written ok:4977 - failed: 0 -  (4714977) +1s
  couchimport { documents: 4977, failed: 0, total: 4714977, totalfailed: 0 } +1s
  couchimport writecomplete { total: 4714977, totalfailed: 0 } +0ms
  couchimport Import complete +43ms

real    19m21.662s
user    0m0.373s
sys     0m2.293s

# cleanup: curl -XDELETE http://127.0.0.1:5984/evrt

```


# Couchbase

```bash
docker run -d --name ed -p 8091-8094:8091-8094 -p 11210:11210 couchbase

```