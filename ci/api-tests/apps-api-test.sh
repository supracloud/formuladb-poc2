set -ex

curl -s -XPOST  -H "Content-Type: application/json" http://frmdb.localhost/formuladb-api/base-app/\$App/SimpleAddHocQuery \
--data-binary '{
    "filterModel": {
        "_id": {
            "filterType": "text",
            "type": "contains",
            "filter": "base"
        }
    }
}
' | grep 'base-app'
