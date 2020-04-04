set -ex

curl -s -XPOST  -H "Content-Type: application/json" http://frmdb.localhost/formuladb-api/base-app/\$Table/SimpleAddHocQuery \
--data-binary '{
    "filterModel": {
        "_id": {
            "filterType": "text",
            "type": "contains",
            "filter": "Dict"
        }
    }
}
' | grep '\$Dictionary'
