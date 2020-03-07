set -ex

curl -s -XPOST  -H "Content-Type: application/json" http://frmdb.localhost/formuladb-api/frmdb-apps/base-app/\$Page/SimpleAddHocQuery \
--data-binary '{
    "filterModel": {
        "app_name": {
            "filterType": "text",
            "type": "equals",
            "filter": "base-app"
        }
    }
}
' | grep 'landing-page.html'
