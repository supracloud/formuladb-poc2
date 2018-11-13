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

```bash
docker run -v $(pwd)/../ep-data:/data --name ep -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

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
  count
---------
 4811899
(1 row)

docker exec -it ep bash

#docker run -d -v $(pwd)/../ec-data:/opt/couchdb/data -p 5984:5984 --name ec couchdb
docker run -d -p 5984:5984 --name ec couchdb
curl -X PUT http://127.0.0.1:5984/evrt
curl -d @../ep-data/actors.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/evrt/_bulk_docs

#4mil rows cannot work with only one curl call
sed -i 's/_sy5/sy5/' order_items.json
split -l 100000 -d order_items.json
for i in x*; do (echo '{"docs": ['; cat $i ) > _tmp.json && sed -i '$ s/,$/]}/' _tmp.json && mv _tmp.json $i; done
time for i in x*; do time curl -d @${i} -H "Content-type: application/json" -X POST http://127.0.0.1:5984/evrt/_bulk_docs | grep -v '"ok":true'; done

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
