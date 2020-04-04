set -ex

curl -s -XPOST  -H "Content-Type: application/json" http://frmdb.localhost/formuladb-api/base-app/\$Page/SimpleAddHocQuery \
--data-binary '{
    "filterModel": {
        "_id": {
            "filterType": "text",
            "type": "contains",
            "filter": "page"
        }
    }
}
' | grep 'landing-page.html'
