import { Entity, PropertyTypeN, FormulaTypeN } from '../../domain/metadata/entity'

export class MockMetadata {

  public constructor() {
    this.entities.forEach(meta => {
      meta.properties.push({ "name": "mwzType", "type": PropertyTypeN.STRING });
      meta.properties.push({ "name": "_id", "type": PropertyTypeN.STRING });
      meta.properties.push(    {"name": "_rev","type": PropertyTypeN.STRING});
    });

    this.entities.forEach(meta => {
      this.entitiesMap.set(meta._id, meta);
    });

  }

  static General: Entity = {
    mwzType: "Entity_", _id: "General",
    "properties": [],
    module: true
  };

  static Inventory: Entity = {
    mwzType: "Entity_", _id: "Inventory",
    "properties": [],
    module: true
  };

  static Forms: Entity = {
    mwzType: "Entity_", _id: "Forms",
    "properties": [],
    module: true
  };

  static Reports: Entity = {
    mwzType: "Entity_", _id: "Reports",
    "properties": [],
    module: true
  };

  static General__Actor: Entity = {
    mwzType: "Entity_", _id:  "General__Actor",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "username", "type": PropertyTypeN.STRING },
      { "name": "name", "type": PropertyTypeN.STRING },
      { "name": "role", "type": PropertyTypeN.STRING },
      { "name": "password", "type": PropertyTypeN.STRING },
      { "name": "details", "type": PropertyTypeN.STRING },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "parent_code", "type": PropertyTypeN.STRING },
      { "name": "param1", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static General__Currency: Entity = {
    mwzType: "Entity_", _id:  "General__Currency",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING },
      { "name": "rate1", "type": PropertyTypeN.NUMBER },
      { "name": "rate2", "type": PropertyTypeN.NUMBER },
      { "name": "rate3", "type": PropertyTypeN.NUMBER },
      { "name": "rate4", "type": PropertyTypeN.NUMBER },
      { "name": "rate5", "type": PropertyTypeN.NUMBER, }
    ]
  };

  static General__Person: Entity = {
    mwzType: "Entity_", _id:  "General__Person",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "actor_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "name", "type": PropertyTypeN.STRING },
      { "name": "district", "type": PropertyTypeN.STRING },
      { "name": "city", "type": PropertyTypeN.STRING },
      { "name": "address", "type": PropertyTypeN.STRING },
      { "name": "supervisor", "type": PropertyTypeN.STRING },
      { "name": "manager", "type": PropertyTypeN.STRING },
      { "name": "phone", "type": PropertyTypeN.STRING },
      { "name": "fax", "type": PropertyTypeN.STRING },
      { "name": "tax_number", "type": PropertyTypeN.STRING },
      { "name": "details", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static General__User: Entity = {
    mwzType: "Entity_", _id:  "General__User",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "username", "type": PropertyTypeN.STRING },
      { "name": "name", "type": PropertyTypeN.STRING },
      { "name": "role", "type": PropertyTypeN.STRING },
      { "name": "password", "type": PropertyTypeN.STRING },
      { "name": "details", "type": PropertyTypeN.STRING },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "parent_code", "type": PropertyTypeN.STRING },
      { "name": "param1", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Inventory__Client: Entity = {
    mwzType: "Entity_", _id:  "Inventory__Client",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "username", "type": PropertyTypeN.STRING },
      { "name": "name", "type": PropertyTypeN.STRING },
      { "name": "role", "type": PropertyTypeN.STRING },
      { "name": "password", "type": PropertyTypeN.STRING },
      { "name": "details", "type": PropertyTypeN.STRING },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "parent_code", "type": PropertyTypeN.STRING },
      { "name": "param1", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Inventory__InventoryProduct: Entity = {
    mwzType: "Entity_", _id:  "Inventory__InventoryProduct",
    "properties": [
      { "name": "inventory_code", "type": PropertyTypeN.STRING, "allowNull": false },
      {
        name: "product",
        type: PropertyTypeN.SUBENTITY,
        referencedEntity: {
          path: "Inventory__Product",
          copiedProperties: ["code", "name"],
        }
      },
      { "name": "category", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "price", "type": PropertyTypeN.NUMBER, "allowNull": true },
      {
        "name": "currency",
        type: PropertyTypeN.SUBENTITY,
        referencedEntity: {
          path: "General__Currency",
          copiedProperties: ["code", "name"],
        }
      },
      { "name": "minimal_stock", "type": PropertyTypeN.NUMBER, "allowNull": false },
      {
        "name": "received_stock",
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.SUM,
          arguments: [{type: FormulaTypeN.VALUE_OF, relativePath: "receiptItems.received_quantity"}]
        }        
      },
      {
        "name": "available_stock", 
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.SUBTRACT,
          minuend: {type: FormulaTypeN.VALUE_OF, relativePath: "received_stock"},
          subtrahends: [
            {type: FormulaTypeN.VALUE_OF, relativePath: "reserved_stock"},
            {type: FormulaTypeN.VALUE_OF, relativePath: "delivered_stock"}
          ]
        }        
      },
      {
        "name": "reserved_stock",
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.SUM,
          arguments: [{type: FormulaTypeN.VALUE_OF, relativePath: "receiptItems.reserved_quantity"}]
        }        
      },
      {
        "name": "delivered_stock", 
        "type": PropertyTypeN.NUMBER,
      },
      { "name": "moving_stock", "type": PropertyTypeN.NUMBER, "allowNull": false },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false }
    ]
  };

  static Inventory__ReceiptItem: Entity = {
    mwzType: "Entity_", _id:  "Inventory__ReceiptItem",
    "properties": [
      {
        name: "product",
        type: PropertyTypeN.SUBENTITY,
        referencedEntity: {
          path: "Inventory__InventoryProduct",
          copiedProperties: [
            "inventory_code",
            "product_code",
            "price",
            "currency_code",
            "name"
          ]
        }
      },
      { "name": "received_quantity", "type": PropertyTypeN.NUMBER, "allowNull": false },
    ]
  };

  static Inventory__OrderItem: Entity = {
    mwzType: "Entity_", _id:  "Inventory__OrderItem",
    "properties": [
      {
        name: "product",
        type: PropertyTypeN.SUBENTITY,
        referencedEntity: {
          path: "Inventory__InventoryProduct",
          copiedProperties: [
            "inventory_code",
            "product_code",
            "price",
            "currency_code",
            "name"
          ]
        }
      },
      { "name": "requested_quantity", "type": PropertyTypeN.NUMBER, "allowNull": false },
      {
        name: "reserved_quantity", 
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.CHAIN,
          steps: [
            {formula: {type: FormulaTypeN.CURRENT_VALUE_OF, relativePath: "product.available_stock"}, alias: "stock"},
            {formula: {
                type: FormulaTypeN.IF, 
                expression: null,//stock < requested_quantity
                trueValue: null,//requested_quantity
                falseValue: null//stock
              }
            }
          ]
        }
      },
      { "name": "client_stock", "type": PropertyTypeN.NUMBER },
    ]
  };

  static Inventory__ProductListProductUnit: Entity = {
    mwzType: "Entity_", _id:  "Inventory__ProductListProductUnit",
    "properties": [
      { "name": "product_list_product_id", "type": PropertyTypeN.NUMBER, "allowNull": false },
      { "name": "sy5_index", "type": PropertyTypeN.NUMBER, "allowNull": false },
      { "name": "product_unit_code", "type": PropertyTypeN.STRING },
      { "name": "product_code", "type": PropertyTypeN.STRING },
      { "name": "manual_product_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "manual_product_serial", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Inventory__Product: Entity = {
    mwzType: "Entity_", _id:  "Inventory__Product",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "barcode", "type": PropertyTypeN.STRING },
      { "name": "name", "type": PropertyTypeN.STRING, "allowNull": false },
    ]
  };

  static Inventory__ProductUnit: Entity = {
    mwzType: "Entity_", _id:  "Inventory__ProductUnit",
    "properties": [
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "product_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "location", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "serial1", "type": PropertyTypeN.STRING },
      { "name": "serial2", "type": PropertyTypeN.STRING },
      { "name": "serial3", "type": PropertyTypeN.STRING },
      { "name": "serial4", "type": PropertyTypeN.STRING },
      { "name": "serial5", "type": PropertyTypeN.STRING },
      { "name": "serial6", "type": PropertyTypeN.STRING },
      { "name": "serial7", "type": PropertyTypeN.STRING },
      { "name": "install_date", "type": PropertyTypeN.DATETIME },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "nb_piston_cycles", "type": PropertyTypeN.STRING },
      { "name": "brita_counter", "type": PropertyTypeN.STRING },
      { "name": "washing_cycles", "type": PropertyTypeN.STRING, }
    ]
  };

  static Forms__Receipt: Entity = {
    mwzType: "Entity_", _id:  "Forms__Acquisition",
    "properties": [
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Reports__DetailedCentralizerReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__DetailedCentralizerReport",
    "properties": [
      { "name": "name", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "user_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "group", "type": PropertyTypeN.STRING },
      { "name": "client_code", "type": PropertyTypeN.STRING },
      { "name": "file_name", "type": PropertyTypeN.STRING },
      { "name": "start_date", "type": PropertyTypeN.DATETIME },
      { "name": "end_date", "type": PropertyTypeN.DATETIME },
      { "name": "options", "type": PropertyTypeN.STRING },
      { "name": "flags", "type": PropertyTypeN.NUMBER },
      { "name": "last_user", "type": PropertyTypeN.STRING },
      { "name": "last_error", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "created_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "updated_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "exchange_rate", "type": PropertyTypeN.NUMBER, }
    ]
  };

  static Reports__GenericReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__GenericReport",
    "properties": [
      { "name": "name", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "user_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "group", "type": PropertyTypeN.STRING },
      { "name": "client_code", "type": PropertyTypeN.STRING },
      { "name": "file_name", "type": PropertyTypeN.STRING },
      { "name": "start_date", "type": PropertyTypeN.DATETIME },
      { "name": "end_date", "type": PropertyTypeN.DATETIME },
      { "name": "options", "type": PropertyTypeN.STRING },
      { "name": "flags", "type": PropertyTypeN.NUMBER },
      { "name": "last_user", "type": PropertyTypeN.STRING },
      { "name": "last_error", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "created_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "updated_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "exchange_rate", "type": PropertyTypeN.NUMBER, }
    ]
  };

  static Forms__Order: Entity = {
    mwzType: "Entity_", _id:  "Forms__Order",
    "properties": [
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "product_list", type: PropertyTypeN.TABLE, referencedEntity: {path: "Inventory__OrderItem"} },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Reports__ServiceCentralizerReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__ServiceCentralizerReport",
    "properties": [
      { "name": "name", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "user_code", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "type", "type": PropertyTypeN.STRING },
      { "name": "group", "type": PropertyTypeN.STRING },
      { "name": "client_code", "type": PropertyTypeN.STRING },
      { "name": "file_name", "type": PropertyTypeN.STRING },
      { "name": "start_date", "type": PropertyTypeN.DATETIME },
      { "name": "end_date", "type": PropertyTypeN.DATETIME },
      { "name": "options", "type": PropertyTypeN.STRING },
      { "name": "flags", "type": PropertyTypeN.NUMBER },
      { "name": "last_user", "type": PropertyTypeN.STRING },
      { "name": "last_error", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "created_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "updated_at", "type": PropertyTypeN.DATETIME, "allowNull": false },
      { "name": "exchange_rate", "type": PropertyTypeN.NUMBER, }
    ]
  };

  static Forms__ServiceForm: Entity = {
    mwzType: "Entity_", _id:  "Forms__ServiceForm",
    "properties": [
      {
        "name": "code", 
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.CONCATENATE,
          arguments: [
            {type: FormulaTypeN.VALUE_OF, relativePath: "client.code"},
            {type: FormulaTypeN.FORMAT, format: "%09d", values: [{type: FormulaTypeN.CONSTANT, value: "-3"}]}
          ]
        }
        // "type": "FORMULA:CONCATENATE(client.code;FORMAT(\"0\";\"9\";INDEX_IN_INTERVAL(time_of_arrival,monthly))",
      },
      { "name": "product_form_id", "type": PropertyTypeN.NUMBER, "allowNull": false },
      { "name": "client", "type": PropertyTypeN.SUBENTITY, referencedEntity: {path: "Inventory__Client", copiedProperties: ["code", "username"]} },
      { "name": "time_of_arrival", "type": PropertyTypeN.DATETIME },
      { "name": "time_of_departure", "type": PropertyTypeN.DATETIME },
      { "name": "normal_hours", "type": PropertyTypeN.NUMBER },
      { "name": "warranty_hours", "type": PropertyTypeN.NUMBER },
      { "name": "night_hours", "type": PropertyTypeN.NUMBER },
      { "name": "shipment_cost", "type": PropertyTypeN.STRING },
      { "name": "notes", "type": PropertyTypeN.STRING },
      { "name": "technician_code", "type": PropertyTypeN.STRING },
      { "name": "technician2_code", "type": PropertyTypeN.STRING },
      { "name": "client_person", "type": PropertyTypeN.STRING },
      { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
      { "name": "nb_installments", "type": PropertyTypeN.NUMBER },
      { "name": "accommodation", "type": PropertyTypeN.NUMBER },
      { "name": "service_form_units", type: PropertyTypeN.TABLE, properties: [
        { "name": "equipment", "type": PropertyTypeN.SUBENTITY, referencedEntity: {path: "Inventory__ProductUnit", copiedProperties: ['code', 'product_code', 'serial1']} },
        { "name": "product_list", "type": PropertyTypeN.TABLE, referencedEntity: {path: "Inventory__OrderItem"}, isLargeTable: true },
        { "name": "reported_problem", "type": PropertyTypeN.TEXT },
        { "name": "found_problem", "type": PropertyTypeN.TEXT },
        { "name": "work_description", "type": PropertyTypeN.TEXT },
        { "name": "nb_piston_cycles", "type": PropertyTypeN.STRING },
        { "name": "brita_counter", "type": PropertyTypeN.STRING },
        { "name": "washing_cycles", "type": PropertyTypeN.STRING },
        { "name": "state", "type": PropertyTypeN.STRING, "allowNull": false },
        { "name": "equipment_group", "type": PropertyTypeN.STRING, }
      ]}
    ]
  };


  public entities: Entity[] = [
    MockMetadata.General,
    MockMetadata.General__Actor,
    MockMetadata.General__Currency,
    MockMetadata.General__Person,
    MockMetadata.General__User,
    MockMetadata.Inventory,
    MockMetadata.Inventory__Client,
    MockMetadata.Inventory__InventoryProduct,
    MockMetadata.Inventory__OrderItem,
    MockMetadata.Inventory__ReceiptItem,
    MockMetadata.Inventory__ProductListProductUnit,
    MockMetadata.Inventory__Product,
    MockMetadata.Inventory__ProductUnit,
    MockMetadata.Forms,
    MockMetadata.Forms__Receipt,
    MockMetadata.Forms__Order,
    MockMetadata.Forms__ServiceForm,
    MockMetadata.Reports,
    MockMetadata.Reports__DetailedCentralizerReport,
    MockMetadata.Reports__GenericReport,
    MockMetadata.Reports__ServiceCentralizerReport,
  ];

  public entitiesMap = new Map<string, Entity>();

}
