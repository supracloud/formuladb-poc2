import { Entity, PropertyTypeN, FormulaTypeN } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-management/inventory-metadata";

export * from "./inventory-management/inventory-metadata";

export class MockMetadata {

  public constructor() {
    this.entities.forEach(meta => {
      meta.properties.push({ name: "mwzType", type: PropertyTypeN.STRING });
      meta.properties.push({ name: "_id", type: PropertyTypeN.STRING });
      meta.properties.push(    {name: "_rev",type: PropertyTypeN.STRING});
    });

    this.entities.forEach(meta => {
      this.entitiesMap.set(meta._id, meta);
    });

  }

  static General: Entity = {
    mwzType: "Entity_", _id: "General",
    properties: [],
    module: true
  };

  static Financial: Entity = {
    mwzType: "Entity_", _id: "Financial",
    properties: [],
    module: true
  };

  static Forms: Entity = {
    mwzType: "Entity_", _id: "Forms",
    properties: [],
    module: true
  };

  static Reports: Entity = {
    mwzType: "Entity_", _id: "Reports",
    properties: [],
    module: true
  };

  static General__Actor: Entity = {
    mwzType: "Entity_", _id:  "General__Actor",
    properties: [
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "username", type: PropertyTypeN.STRING },
      { name: "name", type: PropertyTypeN.STRING },
      { name: "role", type: PropertyTypeN.STRING },
      { name: "password", type: PropertyTypeN.STRING },
      { name: "details", type: PropertyTypeN.STRING },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "parent_code", type: PropertyTypeN.STRING },
      { name: "param1", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static General__Currency: Entity = {
    mwzType: "Entity_", _id:  "General__Currency",
    properties: [
      { name: "code", type: PropertyTypeN.STRING },
      { name: "rate1", type: PropertyTypeN.NUMBER },
      { name: "rate2", type: PropertyTypeN.NUMBER },
      { name: "rate3", type: PropertyTypeN.NUMBER },
      { name: "rate4", type: PropertyTypeN.NUMBER },
      { name: "rate5", type: PropertyTypeN.NUMBER, }
    ]
  };

  static General__Person: Entity = {
    mwzType: "Entity_", _id:  "General__Person",
    properties: [
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "actor_code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "name", type: PropertyTypeN.STRING },
      { name: "district", type: PropertyTypeN.STRING },
      { name: "city", type: PropertyTypeN.STRING },
      { name: "address", type: PropertyTypeN.STRING },
      { name: "supervisor", type: PropertyTypeN.STRING },
      { name: "manager", type: PropertyTypeN.STRING },
      { name: "phone", type: PropertyTypeN.STRING },
      { name: "fax", type: PropertyTypeN.STRING },
      { name: "tax_number", type: PropertyTypeN.STRING },
      { name: "details", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static General__User: Entity = {
    mwzType: "Entity_", _id:  "General__User",
    properties: [
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "username", type: PropertyTypeN.STRING },
      { name: "name", type: PropertyTypeN.STRING },
      { name: "role", type: PropertyTypeN.STRING },
      { name: "password", type: PropertyTypeN.STRING },
      { name: "details", type: PropertyTypeN.STRING },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "parent_code", type: PropertyTypeN.STRING },
      { name: "param1", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static General__Client: Entity = {
    mwzType: "Entity_", _id:  "Inventory__Client",
    properties: [
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "username", type: PropertyTypeN.STRING },
      { name: "name", type: PropertyTypeN.STRING },
      { name: "role", type: PropertyTypeN.STRING },
      { name: "password", type: PropertyTypeN.STRING },
      { name: "details", type: PropertyTypeN.STRING },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "parent_code", type: PropertyTypeN.STRING },
      { name: "param1", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Financial__Account: Entity = {
    mwzType: "Entity_", _id:  "Financial__Account",
    properties: [
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
      {
        name: "actor",
        type: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
          path: "General__Actor",
          copiedProperties: [
            "code",
            "name",
          ]
        }
      },
    ]
  };

  static Financial__Transaction: Entity = {
    mwzType: "Entity_", _id:  "Financial__Transaction",
    properties: [
      {
        name: "accountDebit",
        type: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
          path: "Financial__Account",
          copiedProperties: [
            "code",
            "name",
          ]
        }
      },
      {
        name: "accountCredit",
        type: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
          path: "Financial__Account",
          copiedProperties: [
            "code",
            "name",
          ]
        }
      },
      { name: "amount", type: PropertyTypeN.NUMBER },
    ]
  };
  
  static Forms__Receipt: Entity = {
    mwzType: "Entity_", _id:  "Forms__Acquisition",
    properties: [
      { name: "type", type: PropertyTypeN.STRING },
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Reports__DetailedCentralizerReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__DetailedCentralizerReport",
    properties: [
      { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "user_code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "group", type: PropertyTypeN.STRING },
      { name: "client_code", type: PropertyTypeN.STRING },
      { name: "file_name", type: PropertyTypeN.STRING },
      { name: "start_date", type: PropertyTypeN.DATETIME },
      { name: "end_date", type: PropertyTypeN.DATETIME },
      { name: "options", type: PropertyTypeN.STRING },
      { name: "flags", type: PropertyTypeN.NUMBER },
      { name: "last_user", type: PropertyTypeN.STRING },
      { name: "last_error", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "created_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "updated_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "exchange_rate", type: PropertyTypeN.NUMBER, }
    ]
  };

  static Reports__GenericReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__GenericReport",
    properties: [
      { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "user_code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "group", type: PropertyTypeN.STRING },
      { name: "client_code", type: PropertyTypeN.STRING },
      { name: "file_name", type: PropertyTypeN.STRING },
      { name: "start_date", type: PropertyTypeN.DATETIME },
      { name: "end_date", type: PropertyTypeN.DATETIME },
      { name: "options", type: PropertyTypeN.STRING },
      { name: "flags", type: PropertyTypeN.NUMBER },
      { name: "last_user", type: PropertyTypeN.STRING },
      { name: "last_error", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "created_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "updated_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "exchange_rate", type: PropertyTypeN.NUMBER, }
    ]
  };

  static Forms__Order: Entity = {
    mwzType: "Entity_", _id:  "Forms__Order",
    properties: [
      { name: "type", type: PropertyTypeN.STRING },
      { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "product_list", type: PropertyTypeN.TABLE, entity: {path: "Inventory__OrderItem"} },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
  };

  static Reports__ServiceCentralizerReport: Entity = {
    mwzType: "Entity_", _id:  "Reports__ServiceCentralizerReport",
    properties: [
      { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "user_code", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "type", type: PropertyTypeN.STRING },
      { name: "group", type: PropertyTypeN.STRING },
      { name: "client_code", type: PropertyTypeN.STRING },
      { name: "file_name", type: PropertyTypeN.STRING },
      { name: "start_date", type: PropertyTypeN.DATETIME },
      { name: "end_date", type: PropertyTypeN.DATETIME },
      { name: "options", type: PropertyTypeN.STRING },
      { name: "flags", type: PropertyTypeN.NUMBER },
      { name: "last_user", type: PropertyTypeN.STRING },
      { name: "last_error", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "created_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "updated_at", type: PropertyTypeN.DATETIME, "allowNull": false },
      { name: "exchange_rate", type: PropertyTypeN.NUMBER, }
    ]
  };

  static Forms__ServiceForm: Entity = {
    mwzType: "Entity_", _id:  "Forms__ServiceForm",
    properties: [
      {
        name: "code", 
        type: PropertyTypeN.FORMULA,
        formula: {
          type: FormulaTypeN.CONCATENATE,
          arguments: [
            {type: FormulaTypeN.VALUE_OF, property: "client.code"},
            {type: FormulaTypeN.FORMAT, format: "%09d", values: [{
              type: FormulaTypeN.INDEX_OF, property: "time_of_arrival",
              startRange: {type: FormulaTypeN.START_OF_MONTH, property: "time_of_arrival"},
              endRange: {type: FormulaTypeN.END_OF_MONTH, property: "time_of_arrival"},
            }]}
          ]
        }
        // type: "FORMULA:CONCATENATE(client.code;FORMAT(\"0\";\"9\";INDEX_IN_INTERVAL(time_of_arrival,monthly))",
      },
      { name: "product_form_id", type: PropertyTypeN.NUMBER, "allowNull": false },
      { name: "client", type: PropertyTypeN.REFERENCE_ENTITY, entity: {path: "Inventory__Client", copiedProperties: ["code", "username"]} },
      { name: "time_of_arrival", type: PropertyTypeN.DATETIME },
      { name: "time_of_departure", type: PropertyTypeN.DATETIME },
      { name: "normal_hours", type: PropertyTypeN.NUMBER },
      { name: "warranty_hours", type: PropertyTypeN.NUMBER },
      { name: "night_hours", type: PropertyTypeN.NUMBER },
      { name: "shipment_cost", type: PropertyTypeN.STRING },
      { name: "notes", type: PropertyTypeN.STRING },
      { name: "technician_code", type: PropertyTypeN.STRING },
      { name: "technician2_code", type: PropertyTypeN.STRING },
      { name: "client_person", type: PropertyTypeN.STRING },
      { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
      { name: "nb_installments", type: PropertyTypeN.NUMBER },
      { name: "accommodation", type: PropertyTypeN.NUMBER },
      { name: "service_form_units", type: PropertyTypeN.TABLE, properties: [
        { name: "equipment", type: PropertyTypeN.REFERENCE_ENTITY, entity: {path: "Inventory__ProductUnit", copiedProperties: ['code', 'product_code', 'serial1']} },
        { name: "product_list", type: PropertyTypeN.TABLE, entity: {path: "Inventory__OrderItem"}, isLargeTable: true },
        { name: "reported_problem", type: PropertyTypeN.TEXT },
        { name: "found_problem", type: PropertyTypeN.TEXT },
        { name: "work_description", type: PropertyTypeN.TEXT },
        { name: "nb_piston_cycles", type: PropertyTypeN.STRING },
        { name: "brita_counter", type: PropertyTypeN.STRING },
        { name: "washing_cycles", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "equipment_group", type: PropertyTypeN.STRING, }
      ]}
    ]
  };


  public entities: Entity[] = [
    MockMetadata.General,
    MockMetadata.General__Actor,
    MockMetadata.General__Currency,
    MockMetadata.General__Person,
    MockMetadata.General__User,
    InventoryMetadata.Inventory,
    MockMetadata.General__Client,
    InventoryMetadata.Inventory__InventoryProduct,
    InventoryMetadata.Inventory__OrderItem,
    InventoryMetadata.Inventory__ReceiptItem,
    InventoryMetadata.Inventory__ProductListProductUnit,
    InventoryMetadata.Inventory__Product,
    InventoryMetadata.Inventory__ProductUnit,
    MockMetadata.Financial,
    MockMetadata.Financial__Account,
    MockMetadata.Financial__Transaction,
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
