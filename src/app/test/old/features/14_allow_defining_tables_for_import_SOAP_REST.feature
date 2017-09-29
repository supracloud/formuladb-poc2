//There should be a formula called IMPORT_SOAP which will take an SOAP endpoint, source field selector/xPath
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
//      "$formula": "IMPORT_SOAP('http://my.host.name:8080/my/end/point', 'some/path/field1')"
//    },
//    "field2": {
//      "type": "formula",
//      "$formula": "IMPORT_SOAP('http://my.host.name:8080/my/end/point', 'some/other/path/field2')"
//    }
//  }
//};

//Same approach for REST APIs
