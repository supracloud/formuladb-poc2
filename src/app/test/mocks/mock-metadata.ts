import { Entity } from '../../domain/metadata/entity'

export class MockMetadata {

  public constructor() {
    this.entities.forEach(meta => {
      meta.properties.push({ "name": "mwzType", "type": "string", });
      meta.properties.push({ "name": "_id", "type": "string", });
      // meta.properties.push(    {"name": "_rev","type": "string",});
    });

    this.entities.forEach(meta => {
      meta._id = `Entity_:${meta.path}`;
      this.entitiesMap.set(meta.path, meta);
    });

  }

  static General: Entity = {
    mwzType: "Entity_", "path": "General",
    "properties": [],
    module: true
  };

  static Inventory: Entity = {
    mwzType: "Entity_", "path": "Inventory",
    "properties": [],
    module: true
  };

  static TestApplication: Entity = {
    mwzType: "Entity_", "path": "TestApplication",
    "properties": [],
    module: true
  };

  static General__Actor: Entity = {
    mwzType: "Entity_", "path": "General__Actor",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "username", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "role", "type": "string" },
      { "name": "password", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "type", "type": "string" },
      { "name": "parent_code", "type": "string" },
      { "name": "param1", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static General__Currency: Entity = {
    mwzType: "Entity_", "path": "General__Currency",
    "properties": [
      { "name": "code", "type": "string" },
      { "name": "rate1", "type": "decimal" },
      { "name": "rate2", "type": "decimal" },
      { "name": "rate3", "type": "decimal" },
      { "name": "rate4", "type": "decimal" },
      { "name": "rate5", "type": "decimal", }
    ]
  };

  static General__GenericUser: Entity = {
    mwzType: "Entity_", "path": "General__GenericUser",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "username", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "role", "type": "string" },
      { "name": "password", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "type", "type": "string" },
      { "name": "parent_code", "type": "string" },
      { "name": "param1", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static General__Person: Entity = {
    mwzType: "Entity_", "path": "General__Person",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "actor_code", "type": "string", "allowNull": false },
      { "name": "name", "type": "string" },
      { "name": "district", "type": "string" },
      { "name": "city", "type": "string" },
      { "name": "address", "type": "string" },
      { "name": "supervisor", "type": "string" },
      { "name": "manager", "type": "string" },
      { "name": "phone", "type": "string" },
      { "name": "fax", "type": "string" },
      { "name": "tax_number", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static General__User: Entity = {
    mwzType: "Entity_", "path": "General__User",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "username", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "role", "type": "string" },
      { "name": "password", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "type", "type": "string" },
      { "name": "parent_code", "type": "string" },
      { "name": "param1", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static Inventory__Client: Entity = {
    mwzType: "Entity_", "path": "Inventory__Client",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "username", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "role", "type": "string" },
      { "name": "password", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "type", "type": "string" },
      { "name": "parent_code", "type": "string" },
      { "name": "param1", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static Inventory__InventoryProduct: Entity = {
    mwzType: "Entity_", "path": "Inventory__InventoryProduct",
    "properties": [
      { "name": "inventory_code", "type": "string", "allowNull": false },
      {
        "name": "product",
        "type": "ENTITY(/Inventory/Product)",
        "copiedProperties": [
          "code",
          "name"
        ],
      },
      { "name": "category", "type": "string", "allowNull": false },
      { "name": "price", "type": "decimal", "allowNull": true },
      {
        "name": "currency",
        "type": "ENTITY(/General/Currency)",
        "copiedProperties": [
          "code",
          "name"
        ],
      },
      { "name": "minimal_stock", "type": "integer", "allowNull": false },
      {
        "name": "received_stock",
        "type": "integer",
        "allowNull": false,
      },
      {
        "name": "available_stock", 
        "type": "FORMULA:received_stock - reserved_stock - delivered_stock",
      },
      {
        "name": "reserved_stock",
        "type": `FORMULA:
          FILTER(productListItems,productList.isNew?)
          SUM(^.reserved_quantity)
      `,
      },
      {
        "name": "delivered_stock", 
        "type": "FORMULA:todo",
      },
      { "name": "moving_stock", "type": "integer", "allowNull": false },
      { "name": "state", "type": "string", "allowNull": false }
    ]
  };

  static Inventory__ProductListItem: Entity = {
    mwzType: "Entity_", "path": "Inventory__ProductListItem",
    "properties": [
      {
        "type": "ENTITY(/Inventory/InventoryProduct)",
        "name": "product",
        "copiedProperties": [
          "inventory_code",
          "product_code",
          "price",
          "currency_code",
          "name"
        ],
      },
      { "name": "requested_quantity", "type": "integer", "allowNull": false },
      {
        "name": "reserved_quantity", 
        "type": `FORMULA:
          VALUE_NOW(product.available_stock) AS stock
          IIF(stock < requested_quantity, requested_quantity, stock)
        `,
      },
      { "name": "client_stock", "type": "integer" },
    ]
  };

  static Inventory__ProductListProductUnit: Entity = {
    mwzType: "Entity_", "path": "Inventory__ProductListProductUnit",
    "properties": [
      { "name": "product_list_product_id", "type": "integer", "allowNull": false },
      { "name": "sy5_index", "type": "float", "allowNull": false },
      { "name": "product_unit_code", "type": "string" },
      { "name": "product_code", "type": "string" },
      { "name": "manual_product_code", "type": "string", "allowNull": false },
      { "name": "manual_product_serial", "type": "string", "allowNull": false },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static Inventory__Product: Entity = {
    mwzType: "Entity_", "path": "Inventory__Product",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "barcode", "type": "string" },
      { "name": "name", "type": "string", "allowNull": false },
    ]
  };

  static Inventory__ProductUnitCategory: Entity = {
    mwzType: "Entity_", "path": "Inventory__ProductUnitCategory",
    "properties": [
      { "name": "code", "type": "string", }
    ]
  };

  static Inventory__ProductUnit: Entity = {
    mwzType: "Entity_", "path": "Inventory__ProductUnit",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "product_code", "type": "string", "allowNull": false },
      { "name": "location", "type": "string", "allowNull": false },
      { "name": "serial1", "type": "string" },
      { "name": "serial2", "type": "string" },
      { "name": "serial3", "type": "string" },
      { "name": "serial4", "type": "string" },
      { "name": "serial5", "type": "string" },
      { "name": "serial6", "type": "string" },
      { "name": "serial7", "type": "string" },
      { "name": "install_date", "type": "datetime" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "nb_piston_cycles", "type": "string" },
      { "name": "brita_counter", "type": "string" },
      { "name": "washing_cycles", "type": "string", }
    ]
  };

  static Inventory__Supplier: Entity = {
    mwzType: "Entity_", "path": "Inventory__Supplier",
    "properties": [
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "username", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "role", "type": "string" },
      { "name": "password", "type": "string" },
      { "name": "details", "type": "string" },
      { "name": "type", "type": "string" },
      { "name": "parent_code", "type": "string" },
      { "name": "param1", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static TestApplication__Acquisition: Entity = {
    mwzType: "Entity_", "path": "TestApplication__Acquisition",
    "properties": [
      { "name": "type", "type": "string" },
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static TestApplication__DetailedCentralizerReport: Entity = {
    mwzType: "Entity_", "path": "TestApplication__DetailedCentralizerReport",
    "properties": [
      { "name": "name", "type": "string", "allowNull": false },
      { "name": "user_code", "type": "string", "allowNull": false },
      { "name": "type", "type": "string" },
      { "name": "group", "type": "string" },
      { "name": "client_code", "type": "string" },
      { "name": "file_name", "type": "string" },
      { "name": "start_date", "type": "datetime" },
      { "name": "end_date", "type": "datetime" },
      { "name": "options", "type": "string" },
      { "name": "flags", "type": "integer" },
      { "name": "last_user", "type": "string" },
      { "name": "last_error", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "created_at", "type": "datetime", "allowNull": false },
      { "name": "updated_at", "type": "datetime", "allowNull": false },
      { "name": "exchange_rate", "type": "decimal", }
    ]
  };

  static TestApplication__GenericReport: Entity = {
    mwzType: "Entity_", "path": "TestApplication__GenericReport",
    "properties": [
      { "name": "name", "type": "string", "allowNull": false },
      { "name": "user_code", "type": "string", "allowNull": false },
      { "name": "type", "type": "string" },
      { "name": "group", "type": "string" },
      { "name": "client_code", "type": "string" },
      { "name": "file_name", "type": "string" },
      { "name": "start_date", "type": "datetime" },
      { "name": "end_date", "type": "datetime" },
      { "name": "options", "type": "string" },
      { "name": "flags", "type": "integer" },
      { "name": "last_user", "type": "string" },
      { "name": "last_error", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "created_at", "type": "datetime", "allowNull": false },
      { "name": "updated_at", "type": "datetime", "allowNull": false },
      { "name": "exchange_rate", "type": "decimal", }
    ]
  };

  static TestApplication__Order: Entity = {
    mwzType: "Entity_", "path": "TestApplication__Order",
    "properties": [
      { "name": "type", "type": "string" },
      { "name": "code", "type": "string", "allowNull": false },
      { "name": "product_list", "type": "TABLE(/Inventory/ProductListItem)" },
      { "name": "state", "type": "string", "allowNull": false, }
    ]
  };

  static TestApplication__ServiceCentralizerReport: Entity = {
    mwzType: "Entity_", "path": "TestApplication__ServiceCentralizerReport",
    "properties": [
      { "name": "name", "type": "string", "allowNull": false },
      { "name": "user_code", "type": "string", "allowNull": false },
      { "name": "type", "type": "string" },
      { "name": "group", "type": "string" },
      { "name": "client_code", "type": "string" },
      { "name": "file_name", "type": "string" },
      { "name": "start_date", "type": "datetime" },
      { "name": "end_date", "type": "datetime" },
      { "name": "options", "type": "string" },
      { "name": "flags", "type": "integer" },
      { "name": "last_user", "type": "string" },
      { "name": "last_error", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "created_at", "type": "datetime", "allowNull": false },
      { "name": "updated_at", "type": "datetime", "allowNull": false },
      { "name": "exchange_rate", "type": "decimal", }
    ]
  };

  static TestApplication__ServiceForm: Entity = {
    mwzType: "Entity_", "path": "TestApplication__ServiceForm",
    "properties": [
      {
        "name": "code", 
        "type": "FORMULA:CONCATENATE(client.code;LPAD(\"0\";\"9\";INDEX_IN_INTERVAL(time_of_arrival,monthly))",
      },
      { "name": "product_form_id", "type": "integer", "allowNull": false },
      { "name": "client", "type": "ENTITY(/Inventory/Client)", "copiedProperties": ["code", "username"] },
      { "name": "time_of_arrival", "type": "datetime" },
      { "name": "time_of_departure", "type": "datetime" },
      { "name": "normal_hours", "type": "decimal" },
      { "name": "warranty_hours", "type": "decimal" },
      { "name": "night_hours", "type": "decimal" },
      { "name": "shipment_cost", "type": "string" },
      { "name": "notes", "type": "string" },
      { "name": "technician_code", "type": "string" },
      { "name": "technician2_code", "type": "string" },
      { "name": "client_person", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "nb_installments", "type": "integer" },
      { "name": "accommodation", "type": "decimal" },
      { "name": "service_form_units", "type": "TABLE(/TestApplication/ServiceFormUnit)", "copiedProperties": [] }
    ]
  };

  static TestApplication__ServiceFormUnit: Entity = {
    mwzType: "Entity_", "path": "TestApplication__ServiceFormUnit",
    "properties": [
      { "name": "equipment", "type": "ENTITY(/Inventory/ProductUnit)" },
      { "name": "product_list", "type": "TABLE(/Inventory/ProductListItem)", "isLargeTable": true },
      { "name": "product_list_id", "type": "integer", "allowNull": false },
      { "name": "equipment_serial", "type": "string" },
      { "name": "equipment_model", "type": "string" },
      { "name": "equipment_code", "type": "string" },
      { "name": "equipment_type", "type": "string" },
      { "name": "reported_problem", "type": "text" },
      { "name": "found_problem", "type": "text" },
      { "name": "work_description", "type": "text" },
      { "name": "nb_piston_cycles", "type": "string" },
      { "name": "brita_counter", "type": "string" },
      { "name": "washing_cycles", "type": "string" },
      { "name": "state", "type": "string", "allowNull": false },
      { "name": "equipment_group", "type": "string", }
    ]
  };

  public entities: Entity[] = [
    MockMetadata.General,
    MockMetadata.General__Actor,
    MockMetadata.General__Currency,
    MockMetadata.General__GenericUser,
    MockMetadata.General__Person,
    MockMetadata.General__User,
    MockMetadata.Inventory,
    MockMetadata.Inventory__Client,
    MockMetadata.Inventory__InventoryProduct,
    MockMetadata.Inventory__ProductListItem,
    MockMetadata.Inventory__ProductListProductUnit,
    MockMetadata.Inventory__Product,
    MockMetadata.Inventory__ProductUnitCategory,
    MockMetadata.Inventory__ProductUnit,
    MockMetadata.Inventory__Supplier,
    MockMetadata.TestApplication,
    MockMetadata.TestApplication__Acquisition,
    MockMetadata.TestApplication__DetailedCentralizerReport,
    MockMetadata.TestApplication__GenericReport,
    MockMetadata.TestApplication__Order,
    MockMetadata.TestApplication__ServiceCentralizerReport,
    MockMetadata.TestApplication__ServiceForm,
    MockMetadata.TestApplication__ServiceFormUnit,
  ];

  public entitiesMap = new Map<string, Entity>();

}
