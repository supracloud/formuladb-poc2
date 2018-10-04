//There should be a formula called IMPORT_SOAP which will take an SOAP endpoint, source field selector/xPath
//A table used for import can look like this:
//"ImportedTable": {
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
//    "field1": {
//      "type": "formula",
//      "$formula": "IMPORT_SOAP('http://my.host.name:8080/my/end/point', 'some/path/field1')"
//    },
//    "field2": {
//      "type": "formula",
//      "$formula": "IMPORT_SOAP('http://my.host.name:8080/my/end/point', 'some/other/path/field2')"
//    }
//  }
//};

//Same approach for REST APIs
