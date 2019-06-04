curl -XPUT  -H "Content-Type: text/yaml" --data-binary @apps/inventory/App.yml http://localhost:3000/formuladb-api/inventory
curl -XPUT  -H "Content-Type: text/yaml" --data-binary @apps/inventory/Schema.yml http://localhost:3000/formuladb-api/inventory/schema
curl -XPUT  -H "Content-Type: text/csv" --data-binary @apps/inventory/\$User.csv http://localhost:3000/formuladb-api/inventory/bulk
