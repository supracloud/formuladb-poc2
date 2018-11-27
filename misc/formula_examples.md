A: _id, x
B: _id, idx, list

B.list= TEXTJOIN(IF(A._id, FLOOR(x/4) == @[idx]),";;")

```json
{
    "type_": "CompiledFormulaN",
    "rawExpr": "IF(A._id, FLOOR(x/4) == @[idx])",
    "targetEntityName": "B",
    "targetPropertyName": "list=",
    "triggers": [
        {
            "type_": "MapReduceTriggerN",
            "rawExpr": "IF(A._id, FLOOR(x/4) == @[idx])",
            "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
                "aggsViewName": "vaggs-A-TEXTJOIN(IF(A._id%2C___FLOOR(x'div'4)___%3D%3D___%40%5Bidx%5D)%2C%22%3B%3B%22)",
                "map": {
                    "entityName": "A",
                    "keyExpr": [
                        "FLOOR(x/4)",
                        "_id"
                    ],
                    "valueExpr": "_id",
                    "query": {
                        "startkeyExpr": [
                            "@[idx]",
                            "null"
                        ],
                        "endkeyExpr": [
                            "@[idx]",
                            "\"ZZZZZ\""
                        ],
                        "inclusive_start": true,
                        "inclusive_end": true
                    }
                },
                "reduceFun": "function _textjoin(keys, values, rereduce) {\r\n                var delim = ';;';\r\n                return values.join(delim);\r\n            }",
                "reduceMetadata": {
                    "delimiter": ";;"
                }
            },
            "mapObserversImpactedByOneObservable": {
                "keyExpr": [
                    "@[idx]"
                ],
                "query": {
                    "startkeyExpr": [
                        "FLOOR(x/4)"
                    ],
                    "endkeyExpr": [
                        "FLOOR(x/4)"
                    ],
                    "inclusive_start": true,
                    "inclusive_end": true
                },
                "obsViewName": "vobs-B-TEXTJOIN(IF(A._id%2C___FLOOR(x'div'4)___%3D%3D___%40%5Bidx%5D)%2C%22%3B%3B%22)",
                "valueExpr": "_id",
                "entityName": "B"
            }
        }
    ]
}
```