import { Entity, PropertyTypeN } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as FinancialMetadata from "./financial-metadata";

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export class MockMetadata {

  public constructor() {
    this.entities.forEach(meta => {
      meta.properties.type_ = { type: PropertyTypeN.STRING };
      meta.properties._id = { type: PropertyTypeN.STRING };
      meta.properties._rev = {type: PropertyTypeN.STRING};
    });

    this.entities.forEach(meta => {
      this.entitiesMap.set(meta._id, meta);
    });

  }

  public entities: Entity[] = [
    GeneralMetadata.General,
    GeneralMetadata.General__Actor,
    GeneralMetadata.General__Currency,
    GeneralMetadata.General__Person,
    GeneralMetadata.General__User,
    InventoryMetadata.Inventory,
    GeneralMetadata.General__Client,
    InventoryMetadata.Inventory__Order,
    InventoryMetadata.Inventory__Receipt,
    InventoryMetadata.Inventory__Product,
    InventoryMetadata.Inventory__ProductUnit,
    FinancialMetadata.Financial,
    FinancialMetadata.Financial__Account,
    FinancialMetadata.Financial__Transaction,
    FormsMetadata.Forms,
    FormsMetadata.Forms__Receipt,
    FormsMetadata.Forms__Order,
    FormsMetadata.Forms__ServiceForm,
    ReportsMetadata.Reports,
    ReportsMetadata.Reports__DetailedCentralizerReport,
    ReportsMetadata.Reports__GenericReport,
    ReportsMetadata.Reports__ServiceCentralizerReport,
  ];

  public entitiesMap = new Map<string, Entity>();
}
