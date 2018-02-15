//curl -s -XGET http://127.0.0.1:5984/mwzhistory/_all_docs?include_docs=true | jq '[.rows| .[] | .doc | select(.type_ != "Entity_") | select(.type_ != "Form_") | del(._rev)]' > tmp.json

export const TEST_DATA = [
    {
      "type_": "/Forms/ServiceCentralizerReport",
      "name": "name100",
      "user_code": "user_code101",
      "group": "group102",
      "client_code": "client_code103",
      "file_name": "file_name104",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options107",
      "flags": 108,
      "last_user": "last_user109",
      "last_error": "last_error110",
      "state": "state111",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 114,
      "_id": "UUID-Forms-ServiceCentralizerReport:1"
    },
    {
      "type_": "/Forms/ServiceCentralizerReport",
      "name": "name200",
      "user_code": "user_code201",
      "group": "group202",
      "client_code": "client_code203",
      "file_name": "file_name204",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options207",
      "flags": 208,
      "last_user": "last_user209",
      "last_error": "last_error210",
      "state": "state211",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 214,
      "_id": "UUID-Forms-ServiceCentralizerReport:2"
    },
    {
      "type_": "/Forms/ServiceCentralizerReport",
      "name": "name300",
      "user_code": "user_code301",
      "group": "group302",
      "client_code": "client_code303",
      "file_name": "file_name304",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options307",
      "flags": 308,
      "last_user": "last_user309",
      "last_error": "last_error310",
      "state": "state311",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 314,
      "_id": "UUID-Forms-ServiceCentralizerReport:3"
    },
    {
      "type_": "/Forms/ServiceForm",
      "product_form_id": 101,
      "client": {
        "ref_": "/Inventory/Client/UUID-Inventory-Client:1",
        "code": "code100",
        "username": "username101",
        "_id": "UUID-/Inventory/Client/UUID-Inventory-Client:1"
      },
      "time_of_arrival": "2018-02-15T19:41:58.177Z",
      "time_of_departure": "2018-02-15T19:41:58.177Z",
      "normal_hours": 105,
      "warranty_hours": 106,
      "night_hours": 107,
      "shipment_cost": "shipment_cost108",
      "notes": "notes109",
      "technician_code": "technician_code110",
      "technician2_code": "technician2_code111",
      "client_person": "client_person112",
      "state": "state113",
      "nb_installments": 114,
      "accommodation": 115,
      "service_form_units": [
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3",
            "code": "code300",
            "serial1": "serial1303",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_116001",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_116002",
          "work_description": "work_description_work_description_work_description_work_description_work_description_116003",
          "nb_piston_cycles": "nb_piston_cycles116004",
          "brita_counter": "brita_counter116005",
          "washing_cycles": "washing_cycles116006",
          "state": "state116007",
          "equipment_group": "equipment_group116008",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 116009001,
              "client_stock": 116009004,
              "_id": "UUID-Forms-ServiceForm-t-1160090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 116009101,
              "client_stock": 116009104,
              "_id": "UUID-Forms-ServiceForm-t-1160091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 116009201,
              "client_stock": 116009204,
              "_id": "UUID-Forms-ServiceForm-t-1160092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-1160"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1",
            "code": "code100",
            "serial1": "serial1103",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_116101",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_116102",
          "work_description": "work_description_work_description_work_description_work_description_work_description_116103",
          "nb_piston_cycles": "nb_piston_cycles116104",
          "brita_counter": "brita_counter116105",
          "washing_cycles": "washing_cycles116106",
          "state": "state116107",
          "equipment_group": "equipment_group116108",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 116109001,
              "client_stock": 116109004,
              "_id": "UUID-Forms-ServiceForm-t-1161090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 116109101,
              "client_stock": 116109104,
              "_id": "UUID-Forms-ServiceForm-t-1161091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 116109201,
              "client_stock": 116109204,
              "_id": "UUID-Forms-ServiceForm-t-1161092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-1161"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2",
            "code": "code200",
            "serial1": "serial1203",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_116201",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_116202",
          "work_description": "work_description_work_description_work_description_work_description_work_description_116203",
          "nb_piston_cycles": "nb_piston_cycles116204",
          "brita_counter": "brita_counter116205",
          "washing_cycles": "washing_cycles116206",
          "state": "state116207",
          "equipment_group": "equipment_group116208",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 116209001,
              "client_stock": 116209004,
              "_id": "UUID-Forms-ServiceForm-t-1162090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 116209101,
              "client_stock": 116209104,
              "_id": "UUID-Forms-ServiceForm-t-1162091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 116209201,
              "client_stock": 116209204,
              "_id": "UUID-Forms-ServiceForm-t-1162092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-1162"
        }
      ],
      "_id": "UUID-Forms-ServiceForm:1"
    },
    {
      "type_": "/Forms/ServiceForm",
      "product_form_id": 201,
      "client": {
        "ref_": "/Inventory/Client/UUID-Inventory-Client:2",
        "code": "code200",
        "username": "username201",
        "_id": "UUID-/Inventory/Client/UUID-Inventory-Client:2"
      },
      "time_of_arrival": "2018-02-15T19:41:58.177Z",
      "time_of_departure": "2018-02-15T19:41:58.177Z",
      "normal_hours": 205,
      "warranty_hours": 206,
      "night_hours": 207,
      "shipment_cost": "shipment_cost208",
      "notes": "notes209",
      "technician_code": "technician_code210",
      "technician2_code": "technician2_code211",
      "client_person": "client_person212",
      "state": "state213",
      "nb_installments": 214,
      "accommodation": 215,
      "service_form_units": [
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1",
            "code": "code100",
            "serial1": "serial1103",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_216001",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_216002",
          "work_description": "work_description_work_description_work_description_work_description_work_description_216003",
          "nb_piston_cycles": "nb_piston_cycles216004",
          "brita_counter": "brita_counter216005",
          "washing_cycles": "washing_cycles216006",
          "state": "state216007",
          "equipment_group": "equipment_group216008",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 216009001,
              "client_stock": 216009004,
              "_id": "UUID-Forms-ServiceForm-t-2160090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 216009101,
              "client_stock": 216009104,
              "_id": "UUID-Forms-ServiceForm-t-2160091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 216009201,
              "client_stock": 216009204,
              "_id": "UUID-Forms-ServiceForm-t-2160092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-2160"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2",
            "code": "code200",
            "serial1": "serial1203",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_216101",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_216102",
          "work_description": "work_description_work_description_work_description_work_description_work_description_216103",
          "nb_piston_cycles": "nb_piston_cycles216104",
          "brita_counter": "brita_counter216105",
          "washing_cycles": "washing_cycles216106",
          "state": "state216107",
          "equipment_group": "equipment_group216108",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 216109001,
              "client_stock": 216109004,
              "_id": "UUID-Forms-ServiceForm-t-2161090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 216109101,
              "client_stock": 216109104,
              "_id": "UUID-Forms-ServiceForm-t-2161091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 216109201,
              "client_stock": 216109204,
              "_id": "UUID-Forms-ServiceForm-t-2161092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-2161"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3",
            "code": "code300",
            "serial1": "serial1303",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_216201",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_216202",
          "work_description": "work_description_work_description_work_description_work_description_work_description_216203",
          "nb_piston_cycles": "nb_piston_cycles216204",
          "brita_counter": "brita_counter216205",
          "washing_cycles": "washing_cycles216206",
          "state": "state216207",
          "equipment_group": "equipment_group216208",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 216209001,
              "client_stock": 216209004,
              "_id": "UUID-Forms-ServiceForm-t-2162090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 216209101,
              "client_stock": 216209104,
              "_id": "UUID-Forms-ServiceForm-t-2162091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 216209201,
              "client_stock": 216209204,
              "_id": "UUID-Forms-ServiceForm-t-2162092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-2162"
        }
      ],
      "_id": "UUID-Forms-ServiceForm:2"
    },
    {
      "type_": "/Forms/ServiceForm",
      "product_form_id": 301,
      "client": {
        "ref_": "/Inventory/Client/UUID-Inventory-Client:3",
        "code": "code300",
        "username": "username301",
        "_id": "UUID-/Inventory/Client/UUID-Inventory-Client:3"
      },
      "time_of_arrival": "2018-02-15T19:41:58.178Z",
      "time_of_departure": "2018-02-15T19:41:58.178Z",
      "normal_hours": 305,
      "warranty_hours": 306,
      "night_hours": 307,
      "shipment_cost": "shipment_cost308",
      "notes": "notes309",
      "technician_code": "technician_code310",
      "technician2_code": "technician2_code311",
      "client_person": "client_person312",
      "state": "state313",
      "nb_installments": 314,
      "accommodation": 315,
      "service_form_units": [
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2",
            "code": "code200",
            "serial1": "serial1203",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:2"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_316001",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_316002",
          "work_description": "work_description_work_description_work_description_work_description_work_description_316003",
          "nb_piston_cycles": "nb_piston_cycles316004",
          "brita_counter": "brita_counter316005",
          "washing_cycles": "washing_cycles316006",
          "state": "state316007",
          "equipment_group": "equipment_group316008",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 316009001,
              "client_stock": 316009004,
              "_id": "UUID-Forms-ServiceForm-t-3160090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 316009101,
              "client_stock": 316009104,
              "_id": "UUID-Forms-ServiceForm-t-3160091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 316009201,
              "client_stock": 316009204,
              "_id": "UUID-Forms-ServiceForm-t-3160092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-3160"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3",
            "code": "code300",
            "serial1": "serial1303",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:3"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_316101",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_316102",
          "work_description": "work_description_work_description_work_description_work_description_work_description_316103",
          "nb_piston_cycles": "nb_piston_cycles316104",
          "brita_counter": "brita_counter316105",
          "washing_cycles": "washing_cycles316106",
          "state": "state316107",
          "equipment_group": "equipment_group316108",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 316109001,
              "client_stock": 316109004,
              "_id": "UUID-Forms-ServiceForm-t-3161090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 316109101,
              "client_stock": 316109104,
              "_id": "UUID-Forms-ServiceForm-t-3161091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 316109201,
              "client_stock": 316109204,
              "_id": "UUID-Forms-ServiceForm-t-3161092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-3161"
        },
        {
          "equipment": {
            "ref_": "/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1",
            "code": "code100",
            "serial1": "serial1103",
            "_id": "UUID-/Inventory/ProductUnit/UUID-Inventory-ProductUnit:1"
          },
          "reported_problem": "reported_problem_reported_problem_reported_problem_reported_problem_reported_problem_316201",
          "found_problem": "found_problem_found_problem_found_problem_found_problem_found_problem_316202",
          "work_description": "work_description_work_description_work_description_work_description_work_description_316203",
          "nb_piston_cycles": "nb_piston_cycles316204",
          "brita_counter": "brita_counter316205",
          "washing_cycles": "washing_cycles316206",
          "state": "state316207",
          "equipment_group": "equipment_group316208",
          "items": [
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
                "name": "name102",
                "locationCode": "locationCode104000",
                "price": 104002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
              },
              "requested_quantity": 316209001,
              "client_stock": 316209004,
              "_id": "UUID-Forms-ServiceForm-t-3162090"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
                "name": "name202",
                "locationCode": "locationCode204000",
                "price": 204002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
              },
              "requested_quantity": 316209101,
              "client_stock": 316209104,
              "_id": "UUID-Forms-ServiceForm-t-3162091"
            },
            {
              "product": {
                "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
                "name": "name302",
                "locationCode": "locationCode304000",
                "price": 304002,
                "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
              },
              "requested_quantity": 316209201,
              "client_stock": 316209204,
              "_id": "UUID-Forms-ServiceForm-t-3162092"
            }
          ],
          "_id": "UUID-Forms-ServiceForm-t-3162"
        }
      ],
      "_id": "UUID-Forms-ServiceForm:3"
    },
    {
      "type_": "/General/Actor",
      "code": "code100",
      "username": "username101",
      "name": "name102",
      "role": "role103",
      "password": "password104",
      "details": "details105",
      "type": "type106",
      "parent_code": "parent_code107",
      "param1": "param1108",
      "state": "state109",
      "_id": "UUID-General-Actor:1"
    },
    {
      "type_": "/General/Actor",
      "code": "code200",
      "username": "username201",
      "name": "name202",
      "role": "role203",
      "password": "password204",
      "details": "details205",
      "type": "type206",
      "parent_code": "parent_code207",
      "param1": "param1208",
      "state": "state209",
      "_id": "UUID-General-Actor:2"
    },
    {
      "type_": "/General/Actor",
      "code": "code300",
      "username": "username301",
      "name": "name302",
      "role": "role303",
      "password": "password304",
      "details": "details305",
      "type": "type306",
      "parent_code": "parent_code307",
      "param1": "param1308",
      "state": "state309",
      "_id": "UUID-General-Actor:3"
    },
    {
      "type_": "/General/Currency",
      "code": "code100",
      "rate1": 101,
      "rate2": 102,
      "rate3": 103,
      "rate4": 104,
      "rate5": 105,
      "_id": "UUID-General-Currency:1"
    },
    {
      "type_": "/General/Currency",
      "code": "code200",
      "rate1": 201,
      "rate2": 202,
      "rate3": 203,
      "rate4": 204,
      "rate5": 205,
      "_id": "UUID-General-Currency:2"
    },
    {
      "type_": "/General/Currency",
      "code": "code300",
      "rate1": 301,
      "rate2": 302,
      "rate3": 303,
      "rate4": 304,
      "rate5": 305,
      "_id": "UUID-General-Currency:3"
    },
    {
      "type_": "/General/Person",
      "code": "code100",
      "actor_code": "actor_code101",
      "name": "name102",
      "district": "district103",
      "city": "city104",
      "address": "address105",
      "supervisor": "supervisor106",
      "manager": "manager107",
      "phone": "phone108",
      "fax": "fax109",
      "tax_number": "tax_number110",
      "details": "details111",
      "state": "state112",
      "_id": "UUID-General-Person:1"
    },
    {
      "type_": "/General/Person",
      "code": "code200",
      "actor_code": "actor_code201",
      "name": "name202",
      "district": "district203",
      "city": "city204",
      "address": "address205",
      "supervisor": "supervisor206",
      "manager": "manager207",
      "phone": "phone208",
      "fax": "fax209",
      "tax_number": "tax_number210",
      "details": "details211",
      "state": "state212",
      "_id": "UUID-General-Person:2"
    },
    {
      "type_": "/General/Person",
      "code": "code300",
      "actor_code": "actor_code301",
      "name": "name302",
      "district": "district303",
      "city": "city304",
      "address": "address305",
      "supervisor": "supervisor306",
      "manager": "manager307",
      "phone": "phone308",
      "fax": "fax309",
      "tax_number": "tax_number310",
      "details": "details311",
      "state": "state312",
      "_id": "UUID-General-Person:3"
    },
    {
      "type_": "/General/User",
      "code": "code100",
      "username": "username101",
      "name": "name102",
      "role": "role103",
      "password": "password104",
      "details": "details105",
      "type": "type106",
      "parent_code": "parent_code107",
      "param1": "param1108",
      "state": "state109",
      "_id": "UUID-General-User:1"
    },
    {
      "type_": "/General/User",
      "code": "code200",
      "username": "username201",
      "name": "name202",
      "role": "role203",
      "password": "password204",
      "details": "details205",
      "type": "type206",
      "parent_code": "parent_code207",
      "param1": "param1208",
      "state": "state209",
      "_id": "UUID-General-User:2"
    },
    {
      "type_": "/General/User",
      "code": "code300",
      "username": "username301",
      "name": "name302",
      "role": "role303",
      "password": "password304",
      "details": "details305",
      "type": "type306",
      "parent_code": "parent_code307",
      "param1": "param1308",
      "state": "state309",
      "_id": "UUID-General-User:3"
    },
    {
      "type_": "/Inventory/Client",
      "code": "code100",
      "username": "username101",
      "name": "name102",
      "role": "role103",
      "password": "password104",
      "details": "details105",
      "type": "type106",
      "parent_code": "parent_code107",
      "param1": "param1108",
      "state": "state109",
      "_id": "UUID-Inventory-Client:1"
    },
    {
      "type_": "/Inventory/Client",
      "code": "code200",
      "username": "username201",
      "name": "name202",
      "role": "role203",
      "password": "password204",
      "details": "details205",
      "type": "type206",
      "parent_code": "parent_code207",
      "param1": "param1208",
      "state": "state209",
      "_id": "UUID-Inventory-Client:2"
    },
    {
      "type_": "/Inventory/Client",
      "code": "code300",
      "username": "username301",
      "name": "name302",
      "role": "role303",
      "password": "password304",
      "details": "details305",
      "type": "type306",
      "parent_code": "parent_code307",
      "param1": "param1308",
      "state": "state309",
      "_id": "UUID-Inventory-Client:3"
    },
    {
      "type_": "/Inventory/Order",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "requested_quantity": 100001,
          "client_stock": 100004,
          "_id": "UUID-Inventory-Order-t-1000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "requested_quantity": 100101,
          "client_stock": 100104,
          "_id": "UUID-Inventory-Order-t-1001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "requested_quantity": 100201,
          "client_stock": 100204,
          "_id": "UUID-Inventory-Order-t-1002"
        }
      ],
      "_id": "UUID-Inventory-Order:1"
    },
    {
      "type_": "/Inventory/Order",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "requested_quantity": 200001,
          "client_stock": 200004,
          "_id": "UUID-Inventory-Order-t-2000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "requested_quantity": 200101,
          "client_stock": 200104,
          "_id": "UUID-Inventory-Order-t-2001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "requested_quantity": 200201,
          "client_stock": 200204,
          "_id": "UUID-Inventory-Order-t-2002"
        }
      ],
      "_id": "UUID-Inventory-Order:2"
    },
    {
      "type_": "/Inventory/Order",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "requested_quantity": 300001,
          "client_stock": 300004,
          "_id": "UUID-Inventory-Order-t-3000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "requested_quantity": 300101,
          "client_stock": 300104,
          "_id": "UUID-Inventory-Order-t-3001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "requested_quantity": 300201,
          "client_stock": 300204,
          "_id": "UUID-Inventory-Order-t-3002"
        }
      ],
      "_id": "UUID-Inventory-Order:3"
    },
    {
      "type_": "/Inventory/Product",
      "code": "code100",
      "barcode": "barcode101",
      "name": "name102",
      "description": "description103",
      "inventoryLocation": [
        {
          "locationCode": "locationCode104000",
          "category": "category104001",
          "price": 104002,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:3",
            "code": "code300",
            "_id": "UUID-/General/Currency/UUID-General-Currency:3"
          },
          "minimal_stock": 104004,
          "delivered_stock": 104008,
          "moving_stock": 104009,
          "state": "state104010",
          "_id": "UUID-Inventory-Product-t-1040"
        },
        {
          "locationCode": "locationCode104100",
          "category": "category104101",
          "price": 104102,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:1",
            "code": "code100",
            "_id": "UUID-/General/Currency/UUID-General-Currency:1"
          },
          "minimal_stock": 104104,
          "delivered_stock": 104108,
          "moving_stock": 104109,
          "state": "state104110",
          "_id": "UUID-Inventory-Product-t-1041"
        },
        {
          "locationCode": "locationCode104200",
          "category": "category104201",
          "price": 104202,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:2",
            "code": "code200",
            "_id": "UUID-/General/Currency/UUID-General-Currency:2"
          },
          "minimal_stock": 104204,
          "delivered_stock": 104208,
          "moving_stock": 104209,
          "state": "state104210",
          "_id": "UUID-Inventory-Product-t-1042"
        }
      ],
      "_id": "UUID-Inventory-Product:1"
    },
    {
      "type_": "/Inventory/Product",
      "code": "code200",
      "barcode": "barcode201",
      "name": "name202",
      "description": "description203",
      "inventoryLocation": [
        {
          "locationCode": "locationCode204000",
          "category": "category204001",
          "price": 204002,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:1",
            "code": "code100",
            "_id": "UUID-/General/Currency/UUID-General-Currency:1"
          },
          "minimal_stock": 204004,
          "delivered_stock": 204008,
          "moving_stock": 204009,
          "state": "state204010",
          "_id": "UUID-Inventory-Product-t-2040"
        },
        {
          "locationCode": "locationCode204100",
          "category": "category204101",
          "price": 204102,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:2",
            "code": "code200",
            "_id": "UUID-/General/Currency/UUID-General-Currency:2"
          },
          "minimal_stock": 204104,
          "delivered_stock": 204108,
          "moving_stock": 204109,
          "state": "state204110",
          "_id": "UUID-Inventory-Product-t-2041"
        },
        {
          "locationCode": "locationCode204200",
          "category": "category204201",
          "price": 204202,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:3",
            "code": "code300",
            "_id": "UUID-/General/Currency/UUID-General-Currency:3"
          },
          "minimal_stock": 204204,
          "delivered_stock": 204208,
          "moving_stock": 204209,
          "state": "state204210",
          "_id": "UUID-Inventory-Product-t-2042"
        }
      ],
      "_id": "UUID-Inventory-Product:2"
    },
    {
      "type_": "/Inventory/Product",
      "code": "code300",
      "barcode": "barcode301",
      "name": "name302",
      "description": "description303",
      "inventoryLocation": [
        {
          "locationCode": "locationCode304000",
          "category": "category304001",
          "price": 304002,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:2",
            "code": "code200",
            "_id": "UUID-/General/Currency/UUID-General-Currency:2"
          },
          "minimal_stock": 304004,
          "delivered_stock": 304008,
          "moving_stock": 304009,
          "state": "state304010",
          "_id": "UUID-Inventory-Product-t-3040"
        },
        {
          "locationCode": "locationCode304100",
          "category": "category304101",
          "price": 304102,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:3",
            "code": "code300",
            "_id": "UUID-/General/Currency/UUID-General-Currency:3"
          },
          "minimal_stock": 304104,
          "delivered_stock": 304108,
          "moving_stock": 304109,
          "state": "state304110",
          "_id": "UUID-Inventory-Product-t-3041"
        },
        {
          "locationCode": "locationCode304200",
          "category": "category304201",
          "price": 304202,
          "currency": {
            "ref_": "/General/Currency/UUID-General-Currency:1",
            "code": "code100",
            "_id": "UUID-/General/Currency/UUID-General-Currency:1"
          },
          "minimal_stock": 304204,
          "delivered_stock": 304208,
          "moving_stock": 304209,
          "state": "state304210",
          "_id": "UUID-Inventory-Product-t-3042"
        }
      ],
      "_id": "UUID-Inventory-Product:3"
    },
    {
      "type_": "/Inventory/ProductUnit",
      "code": "code100",
      "product": {
        "ref_": "/Inventory/Product/UUID-Inventory-Product:3",
        "code": "code300",
        "name": "name302",
        "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3"
      },
      "inventoryLocation": "inventoryLocation102",
      "serial1": "serial1103",
      "serial2": "serial2104",
      "serial3": "serial3105",
      "serial4": "serial4106",
      "serial5": "serial5107",
      "serial6": "serial6108",
      "serial7": "serial7109",
      "install_date": "2018-02-15T19:41:58.175Z",
      "state": "state111",
      "nb_piston_cycles": "nb_piston_cycles112",
      "brita_counter": "brita_counter113",
      "washing_cycles": "washing_cycles114",
      "_id": "UUID-Inventory-ProductUnit:1"
    },
    {
      "type_": "/Inventory/ProductUnit",
      "code": "code200",
      "product": {
        "ref_": "/Inventory/Product/UUID-Inventory-Product:1",
        "code": "code100",
        "name": "name102",
        "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1"
      },
      "inventoryLocation": "inventoryLocation202",
      "serial1": "serial1203",
      "serial2": "serial2204",
      "serial3": "serial3205",
      "serial4": "serial4206",
      "serial5": "serial5207",
      "serial6": "serial6208",
      "serial7": "serial7209",
      "install_date": "2018-02-15T19:41:58.176Z",
      "state": "state211",
      "nb_piston_cycles": "nb_piston_cycles212",
      "brita_counter": "brita_counter213",
      "washing_cycles": "washing_cycles214",
      "_id": "UUID-Inventory-ProductUnit:2"
    },
    {
      "type_": "/Inventory/ProductUnit",
      "code": "code300",
      "product": {
        "ref_": "/Inventory/Product/UUID-Inventory-Product:2",
        "code": "code200",
        "name": "name202",
        "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2"
      },
      "inventoryLocation": "inventoryLocation302",
      "serial1": "serial1303",
      "serial2": "serial2304",
      "serial3": "serial3305",
      "serial4": "serial4306",
      "serial5": "serial5307",
      "serial6": "serial6308",
      "serial7": "serial7309",
      "install_date": "2018-02-15T19:41:58.176Z",
      "state": "state311",
      "nb_piston_cycles": "nb_piston_cycles312",
      "brita_counter": "brita_counter313",
      "washing_cycles": "washing_cycles314",
      "_id": "UUID-Inventory-ProductUnit:3"
    },
    {
      "type_": "/Inventory/Receipt",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "received_quantity": 100001,
          "_id": "UUID-Inventory-Receipt-t-1000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "received_quantity": 100101,
          "_id": "UUID-Inventory-Receipt-t-1001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "received_quantity": 100201,
          "_id": "UUID-Inventory-Receipt-t-1002"
        }
      ],
      "_id": "UUID-Inventory-Receipt:1"
    },
    {
      "type_": "/Inventory/Receipt",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "received_quantity": 200001,
          "_id": "UUID-Inventory-Receipt-t-2000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "received_quantity": 200101,
          "_id": "UUID-Inventory-Receipt-t-2001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "received_quantity": 200201,
          "_id": "UUID-Inventory-Receipt-t-2002"
        }
      ],
      "_id": "UUID-Inventory-Receipt:2"
    },
    {
      "type_": "/Inventory/Receipt",
      "items": [
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040",
            "name": "name102",
            "locationCode": "locationCode104000",
            "price": 104002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040"
          },
          "received_quantity": 300001,
          "_id": "UUID-Inventory-Receipt-t-3000"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040",
            "name": "name202",
            "locationCode": "locationCode204000",
            "price": 204002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:2/inventoryLocation/UUID-Inventory-Product-t-2040"
          },
          "received_quantity": 300101,
          "_id": "UUID-Inventory-Receipt-t-3001"
        },
        {
          "product": {
            "ref_": "/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040",
            "name": "name302",
            "locationCode": "locationCode304000",
            "price": 304002,
            "_id": "UUID-/Inventory/Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040"
          },
          "received_quantity": 300201,
          "_id": "UUID-Inventory-Receipt-t-3002"
        }
      ],
      "_id": "UUID-Inventory-Receipt:3"
    },
    {
      "type_": "/Reports/DetailedCentralizerReport",
      "name": "name100",
      "user_code": "user_code101",
      "type": "type102",
      "group": "group103",
      "client_code": "client_code104",
      "file_name": "file_name105",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options108",
      "flags": 109,
      "last_user": "last_user110",
      "last_error": "last_error111",
      "state": "state112",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 115,
      "_id": "UUID-Reports-DetailedCentralizerReport:1"
    },
    {
      "type_": "/Reports/DetailedCentralizerReport",
      "name": "name200",
      "user_code": "user_code201",
      "type": "type202",
      "group": "group203",
      "client_code": "client_code204",
      "file_name": "file_name205",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options208",
      "flags": 209,
      "last_user": "last_user210",
      "last_error": "last_error211",
      "state": "state212",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 215,
      "_id": "UUID-Reports-DetailedCentralizerReport:2"
    },
    {
      "type_": "/Reports/DetailedCentralizerReport",
      "name": "name300",
      "user_code": "user_code301",
      "type": "type302",
      "group": "group303",
      "client_code": "client_code304",
      "file_name": "file_name305",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options308",
      "flags": 309,
      "last_user": "last_user310",
      "last_error": "last_error311",
      "state": "state312",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 315,
      "_id": "UUID-Reports-DetailedCentralizerReport:3"
    },
    {
      "type_": "/Reports/GenericReport",
      "name": "name100",
      "user_code": "user_code101",
      "type": "type102",
      "group": "group103",
      "client_code": "client_code104",
      "file_name": "file_name105",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options108",
      "flags": 109,
      "last_user": "last_user110",
      "last_error": "last_error111",
      "state": "state112",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 115,
      "_id": "UUID-Reports-GenericReport:1"
    },
    {
      "type_": "/Reports/GenericReport",
      "name": "name200",
      "user_code": "user_code201",
      "type": "type202",
      "group": "group203",
      "client_code": "client_code204",
      "file_name": "file_name205",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options208",
      "flags": 209,
      "last_user": "last_user210",
      "last_error": "last_error211",
      "state": "state212",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 215,
      "_id": "UUID-Reports-GenericReport:2"
    },
    {
      "type_": "/Reports/GenericReport",
      "name": "name300",
      "user_code": "user_code301",
      "type": "type302",
      "group": "group303",
      "client_code": "client_code304",
      "file_name": "file_name305",
      "start_date": "2018-02-15T19:41:58.178Z",
      "end_date": "2018-02-15T19:41:58.178Z",
      "options": "options308",
      "flags": 309,
      "last_user": "last_user310",
      "last_error": "last_error311",
      "state": "state312",
      "created_at": "2018-02-15T19:41:58.178Z",
      "updated_at": "2018-02-15T19:41:58.178Z",
      "exchange_rate": 315,
      "_id": "UUID-Reports-GenericReport:3"
    }
  ]
  ;
