//It should be possible to copy-paste large amounts of information (possibly entire tables) to and from Excel/csv
//In addition there should be functions available IMPORT_EXCEL(file, column), IMPORT_CSV(file, column), EXPORT_EXCEL(file, query, column), EXPORT_CSV(file, query, column)
//import/export functions may skip header or not
//TODO: think of a good API for this

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
//      "$formula": "EXPORT_EXCEL('file:///my/path/file.xls', '/Inventory/Product/code', 'A')"
//    },
//    "product_name": {
//      "type": "formula",
//      "$formula": "EXPORT_SOAP('file:///my/path/file.xls', '/Inventory/Product/name', 'B')"
//    }
//  }
//};

//A table used for import can look like this:
//"ImportedTable": {
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
//    "field1": {
//      "type": "formula",
//      "$formula": "IMPORT_SOAP('file:///my/path/file.csv', '3')"
//    },
//    "field2": {
//      "type": "formula",
//      "$formula": "IMPORT_SOAP('file:///my/path/file.csv', '4')"
//    }
//  }
//};
