//similarly to the import feature there should be an export feature for SOAP and REST APIs
//A table used for export can look like this:
//"ExportTable": {
//  "type": "table",
//  "properties": {
//    "id": {
//      "type": "string",
//      "allow_null": false
//    },
//    "created_at": {
//      "type": "datetime",
//      "allow_null": true
//    },
//    "updated_at": {
//      "type": "datetime",
//      "allow_null": true
//    },
//    "state": {
//      "type": "string",
//      "allow_null": false
//    },
//    "product_code": {
//      "type": "formula",
//      "$formula": "EXPORT_SOAP('http://my.host.name:8080/my/end/point', '/Inventory/Product/code', 'Some/xPath/Product/Code')"
//    },
//    "product_name": {
//      "type": "formula",
//      "$formula": "EXPORT_SOAP('http://my.host.name:8080/my/end/point', '/Inventory/Product/name', 'Some/xPath/Product/Name')"
//    }
//  }
//};
