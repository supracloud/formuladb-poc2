
# B.sum__ = SUM(A__of__myB.num)
B.sum__ = $TRG$['vaggs-A-SUM(A__of__myB.num)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUM(A__of__myB.num)",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-SUM(A__of__myB.num)",
            "map": {
                "type_": "MapFunctionAndQueryN",
                "rawExpr": "A__of__myB.num",
                "entityName": "A",
                "keyExpr": "[B$myB._id]",
                "valueExpr": "num",
                "query": "[  [$ROW$._id] ---> [$ROW$._id]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-B-SUM(A__of__myB.num)",
            "entityName": "B",
            "existingIndex": "_id",
            "keyExpr": "[B$myB._id]",
            "query": "[  [__existingIndex__] ---> [__existingIndex__]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# B.sum__ = SUMIF(A.num,aY == @[bY])
B.sum__ = $TRG$['vaggs-A-SUMIF(A.num%2CaY___%3D%3D___%40%5BbY%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(A.num,aY == @[bY])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-SUMIF(A.num%2CaY___%3D%3D___%40%5BbY%5D)",
            "map": {
                "entityName": "A",
                "keyExpr": "[aY]",
                "valueExpr": "num",
                "query": "[  [@[bY]] ---> [@[bY]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-B-SUMIF(A.num%2CaY___%3D%3D___%40%5BbY%5D)",
            "entityName": "B",
            "keyExpr": "[@[bY]]",
            "query": "[  [aY] ---> [aY]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# B.list = TEXTJOIN(IF(A._id, FLOOR(x/4) == @[idx]),";;")
B.list = $TRG$['vaggs-A-TEXTJOIN(IF(A._id%2C___FLOOR(x_div_4)___%3D%3D___%40%5Bidx%5D)%2C%22%3B%3B%22)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "IF(A._id, FLOOR(x/4) == @[idx])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-TEXTJOIN(IF(A._id%2C___FLOOR(x_div_4)___%3D%3D___%40%5Bidx%5D)%2C%22%3B%3B%22)",
            "map": {
                "entityName": "A",
                "keyExpr": "[FLOOR(x/4), _id]",
                "valueExpr": "_id",
                "query": "[  [@[idx], null] ---> [@[idx], \"ZZZZZ\"]  ]"
            },
            "reduceFun": "function _textjoin(keys, values, rereduce) {\r\n                var delim = ';;';\r\n                return values.join(delim);\r\n            }",
            "reduceMetadata": {
                "delimiter": ";;"
            }
        },
        "mapObserversImpactedByOneObservable": {
            "keyExpr": "[@[idx]]",
            "query": "[  [FLOOR(x/4)] ---> [FLOOR(x/4)]  ]",
            "obsViewName": "vobs-B-TEXTJOIN(IF(A._id%2C___FLOOR(x_div_4)___%3D%3D___%40%5Bidx%5D)%2C%22%3B%3B%22)",
            "valueExpr": "_id",
            "entityName": "B"
        }
    }
]
```
# Ac.balance__ = 50 + SUMIF(Tr.val, ac2 == @[_id]) - SUMIF(Tr.val, ac1 == @[_id])
Ac.balance__ = 50 + $TRG$['vaggs-Tr-SUMIF(Tr.val%2C___ac2___%3D%3D___%40%5B_id%5D)'] - $TRG$['vaggs-Tr-SUMIF(Tr.val%2C___ac1___%3D%3D___%40%5B_id%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Tr.val, ac2 == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Tr-SUMIF(Tr.val%2C___ac2___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Tr",
                "keyExpr": "[ac2]",
                "valueExpr": "val",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Ac-SUMIF(Tr.val%2C___ac2___%3D%3D___%40%5B_id%5D)",
            "entityName": "Ac",
            "keyExpr": "[@[_id]]",
            "query": "[  [ac2] ---> [ac2]  ]",
            "valueExpr": "_id"
        }
    },
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Tr.val, ac1 == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Tr-SUMIF(Tr.val%2C___ac1___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Tr",
                "keyExpr": "[ac1]",
                "valueExpr": "val",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Ac-SUMIF(Tr.val%2C___ac1___%3D%3D___%40%5B_id%5D)",
            "entityName": "Ac",
            "keyExpr": "[@[_id]]",
            "query": "[  [ac1] ---> [ac1]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# A.idx = RANK([FLOOR(@[x]/4) * 4, @[x]],_MAP(A.x,[FLOOR(x/4) * 4, x]))
A.idx = $TRG$['vaggs-A-RANK(%5BFLOOR(%40%5Bx%5D_div_4)___*___4%2C___%40%5Bx%5D%5D%2C_MAP(A.x%2C%5BFLOOR(x_div_4)___*___4%2C___x%5D))']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "RANK([FLOOR(@[x]/4) * 4, @[x]],_MAP(A.x,[FLOOR(x/4) * 4, x]))",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-RANK(%5BFLOOR(%40%5Bx%5D_div_4)___*___4%2C___%40%5Bx%5D%5D%2C_MAP(A.x%2C%5BFLOOR(x_div_4)___*___4%2C___x%5D))",
            "map": {
                "entityName": "A",
                "keyExpr": "[FLOOR(x/4) * 4, x]",
                "valueExpr": "1",
                "query": "(  [FLOOR(@[x]/4) * 4, null] ---> [FLOOR(@[x]/4) * 4, @[x]]  ]"
            },
            "reduceFun": "_count"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-A-RANK(%5BFLOOR(%40%5Bx%5D_div_4)___*___4%2C___%40%5Bx%5D%5D%2C_MAP(A.x%2C%5BFLOOR(x_div_4)___*___4%2C___x%5D))",
            "entityName": "A",
            "keyExpr": "[FLOOR(@[x]/4) * 4, @[x]]",
            "valueExpr": "_id",
            "query": "[  [FLOOR(x/4) * 4] ---> [FLOOR(x/4) * 4, \"ZZZZZ\"]  ]"
        }
    }
]
```
# B.rank = RANK([FLOOR(@[idx]/4) * 4, @[idx]], _MAP(A.x, [FLOOR(x/4) * 4, x]))
B.rank = $TRG$['vaggs-A-RANK(%5BFLOOR(%40%5Bidx%5D_div_4)___*___4%2C___%40%5Bidx%5D%5D%2C____MAP(A.x%2C___%5BFLOOR(x_div_4)___*___4%2C___x%5D))']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "RANK([FLOOR(@[idx]/4) * 4, @[idx]], _MAP(A.x, [FLOOR(x/4) * 4, x]))",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-RANK(%5BFLOOR(%40%5Bidx%5D_div_4)___*___4%2C___%40%5Bidx%5D%5D%2C____MAP(A.x%2C___%5BFLOOR(x_div_4)___*___4%2C___x%5D))",
            "map": {
                "entityName": "A",
                "keyExpr": "[FLOOR(x/4) * 4, x]",
                "valueExpr": "1",
                "query": "(  [FLOOR(@[idx]/4) * 4, null] ---> [FLOOR(@[idx]/4) * 4, @[idx]]  ]"
            },
            "reduceFun": "_count"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-B-RANK(%5BFLOOR(%40%5Bidx%5D_div_4)___*___4%2C___%40%5Bidx%5D%5D%2C____MAP(A.x%2C___%5BFLOOR(x_div_4)___*___4%2C___x%5D))",
            "entityName": "B",
            "keyExpr": "[FLOOR(@[idx]/4) * 4, @[idx]]",
            "valueExpr": "_id",
            "query": "[  [FLOOR(x/4) * 4] ---> [FLOOR(x/4) * 4, \"ZZZZZ\"]  ]"
        }
    }
]
```
# B.sum__ = SUM(A__of__b.val)
B.sum__ = $TRG$['vaggs-A-SUM(A__of__b.val)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUM(A__of__b.val)",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-A-SUM(A__of__b.val)",
            "map": {
                "type_": "MapFunctionAndQueryN",
                "rawExpr": "A__of__b.val",
                "entityName": "A",
                "keyExpr": "[B$b._id]",
                "valueExpr": "val",
                "query": "[  [$ROW$._id] ---> [$ROW$._id]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-B-SUM(A__of__b.val)",
            "entityName": "B",
            "existingIndex": "_id",
            "keyExpr": "[B$b._id]",
            "query": "[  [__existingIndex__] ---> [__existingIndex__]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# B.x__ = 10 - sum__
B.x__ = 10 - sum__
```json
{}
```
# Inventory___Product___Location.received_stock__ = SUMIF(Inventory___Receipt___Item.quantity, productLocationId == @[_id])
Inventory___Product___Location.received_stock__ = $TRG$['vaggs-Inventory___Receipt___Item-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Inventory___Receipt___Item.quantity, productLocationId == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Inventory___Receipt___Item-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Inventory___Receipt___Item",
                "keyExpr": "[productLocationId]",
                "valueExpr": "quantity",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Inventory___Product___Location-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "entityName": "Inventory___Product___Location",
            "keyExpr": "[@[_id]]",
            "query": "[  [productLocationId] ---> [productLocationId]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# Inventory___Product___Location.available_stock__ = received_stock__ - ordered_stock__
Inventory___Product___Location.available_stock__ = received_stock__ - ordered_stock__
```json
{}
```
# Inventory___Product___Location.ordered_stock__ = SUMIF(Inventory___Order___Item.quantity, productLocationId == @[_id])
Inventory___Product___Location.ordered_stock__ = $TRG$['vaggs-Inventory___Order___Item-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Inventory___Order___Item.quantity, productLocationId == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Inventory___Order___Item-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Inventory___Order___Item",
                "keyExpr": "[productLocationId]",
                "valueExpr": "quantity",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Inventory___Product___Location-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "entityName": "Inventory___Product___Location",
            "keyExpr": "[@[_id]]",
            "query": "[  [productLocationId] ---> [productLocationId]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# Inventory___Order___Item.error_quantity = 0
Inventory___Order___Item.error_quantity = 0
```json
{}
```
# Inventory___Product___Location.received_stock__ = SUMIF(Inventory___Receipt___Item.quantity, productLocationId == @[_id])
Inventory___Product___Location.received_stock__ = $TRG$['vaggs-Inventory___Receipt___Item-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Inventory___Receipt___Item.quantity, productLocationId == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Inventory___Receipt___Item-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Inventory___Receipt___Item",
                "keyExpr": "[productLocationId]",
                "valueExpr": "quantity",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Inventory___Product___Location-SUMIF(Inventory___Receipt___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "entityName": "Inventory___Product___Location",
            "keyExpr": "[@[_id]]",
            "query": "[  [productLocationId] ---> [productLocationId]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# Inventory___Product___Location.ordered_stock__ = SUMIF(Inventory___Order___Item.quantity, productLocationId == @[_id])
Inventory___Product___Location.ordered_stock__ = $TRG$['vaggs-Inventory___Order___Item-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)']
```json
[
    {
        "type_": "MapReduceTriggerN",
        "rawExpr": "SUMIF(Inventory___Order___Item.quantity, productLocationId == @[_id])",
        "mapreduceAggsOfManyObservablesQueryableFromOneObs": {
            "aggsViewName": "vaggs-Inventory___Order___Item-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "map": {
                "entityName": "Inventory___Order___Item",
                "keyExpr": "[productLocationId]",
                "valueExpr": "quantity",
                "query": "[  [@[_id]] ---> [@[_id]]  ]"
            },
            "reduceFun": "_sum"
        },
        "mapObserversImpactedByOneObservable": {
            "obsViewName": "vobs-Inventory___Product___Location-SUMIF(Inventory___Order___Item.quantity%2C___productLocationId___%3D%3D___%40%5B_id%5D)",
            "entityName": "Inventory___Product___Location",
            "keyExpr": "[@[_id]]",
            "query": "[  [productLocationId] ---> [productLocationId]  ]",
            "valueExpr": "_id"
        }
    }
]
```
# Inventory___Product___Location.available_stock__ = received_stock__ - ordered_stock__
Inventory___Product___Location.available_stock__ = received_stock__ - ordered_stock__
```json
{}
```