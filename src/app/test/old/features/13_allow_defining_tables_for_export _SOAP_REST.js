//similarly to the import feature there should be an export feature for SOAP and REST APIs
//A table used for export can look like this:
//"ExportTable": {
//  "type": "table",
//  "properties": {
//    "id": {
//      "type": "string",
//      "allowNull": false
//    },
//    "created_at": {
//      "type": "datetime",
//      "allowNull": true
//    },
//    "updated_at": {
//      "type": "datetime",
//      "allowNull": true
//    },
//    "state": {
//      "type": "string",
//      "allowNull": false
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
