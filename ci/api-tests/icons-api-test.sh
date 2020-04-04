set -ex

curl -s -XPOST  -H "Content-Type: application/json" http://frmdb.localhost/formuladb-api/base-app/\$Icon/SimpleAddHocQuery \
--data-binary '{
    "filterModel": {
        "_id": {
            "filterType": "text",
            "type": "contains",
            "filter": "-car-"
        }
    }
}
' | grep 'fontawesome-solid-car-'