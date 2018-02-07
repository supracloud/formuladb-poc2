import { Entity, PropertyTypeN } from '../../domain/metadata/entity';

export const Inventory: Entity = {
    type_: "Entity_", _id: "Inventory",
    properties: {},
    module: true
};

export const Inventory__Receipt: Entity = {
    type_: "Entity_", _id: "Inventory/Receipt",
    properties: {
        items: {
            type: PropertyTypeN.TABLE,
            properties: {
                product: {
                    type: PropertyTypeN.REFERENCE_ENTITY,
                    entity: {
                        deepPath: "/Inventory/Product/location",
                        copiedProperties: [
                            "code",
                            "name",
                            "location",
                            "price",
                            "currency_code",
                        ]
                    }
                },
                received_quantity: { type: PropertyTypeN.NUMBER, allowNull: false },
                units: {
                    type: PropertyTypeN.TABLE,
                    properties: {
                        unit: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: "/Inventory/ProductUnit", copiedProperties: ["code", "serial"] } }
                    }
                },
            }
        }
    }
};

export const Inventory__Order: Entity = {
    type_: "Entity_", _id: "Inventory/Order",
    properties: {
        items: {
            type: PropertyTypeN.TABLE, properties: {
                product: {
                    type: PropertyTypeN.REFERENCE_ENTITY,
                    entity: {
                        deepPath: "/Inventory/Product/locations/",
                        copiedProperties: [
                            "code",
                            "name",
                            "location",
                            "price",
                            "currency_code",
                        ]
                    }
                },
                requested_quantity: { type: PropertyTypeN.NUMBER, allowNull: false },
                available_stock: { type: PropertyTypeN.FORMULA, formula: { CURRENT_VALUE_OF: "product.available_stock" } },
                reserved_quantity: {
                    type: PropertyTypeN.FORMULA,
                    formula: {
                        IF: {
                            expression: { EXPRESSION: 'available_stock > requested_quantity' },
                            trueValue: { EXPRESSION: 'requested_quantity' },
                            falseValue: { EXPRESSION: 'available_stock' },
                        }
                    }
                },
                client_stock: { type: PropertyTypeN.NUMBER },
                units: {
                    type: PropertyTypeN.TABLE,
                    properties: {
                        unit: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: "/Inventory/ProductUnit", copiedProperties: ["code", "serial"] } }
                    }
                },
            }
        }
    }
};

export const Inventory__Product: Entity = {
    type_: "Entity_", _id: "Inventory/Product",
    properties: {
        code: { type: PropertyTypeN.STRING, allowNull: false },
        barcode: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING, allowNull: false },
        description: { type: PropertyTypeN.STRING },
        locations: {
            type: PropertyTypeN.TABLE, properties: {
                location: { type: PropertyTypeN.STRING, allowNull: false, defaultValue: "DEFAULT-LOCATION" },
                category: { type: PropertyTypeN.STRING, allowNull: false },
                price: { type: PropertyTypeN.NUMBER, allowNull: true },
                currency: {
                    type: PropertyTypeN.REFERENCE_ENTITY,
                    entity: {
                        deepPath: "/General/Currency",
                        copiedProperties: ["code", "name"],
                    }
                },
                minimal_stock: { type: PropertyTypeN.NUMBER, allowNull: false },
                received_stock: {
                    type: PropertyTypeN.FORMULA,
                    formula: {
                        SUM: [{ EXPRESSION: "receiptItems.received_quantity"}]
                    }
                },
                available_stock: {
                    type: PropertyTypeN.FORMULA,
                    formula: {
                        EXPRESSION: 'received_stock - reserved_stock - delivered_stock'
                    }
                },
                reserved_stock: {
                    type: PropertyTypeN.FORMULA,
                    formula: {
                        SUM: [{ EXPRESSION: "orderItems.reserved_quantity" }]
                    }
                },
                delivered_stock: { type: PropertyTypeN.NUMBER },
                moving_stock: { type: PropertyTypeN.NUMBER, allowNull: false },
                state: { type: PropertyTypeN.STRING, allowNull: false }
            }
        }
    }
};

export const Inventory__ProductUnit: Entity = {
    type_: "Entity_", _id: "Inventory/ProductUnit",
    properties: {
        code: { type: PropertyTypeN.STRING, allowNull: false },
        product: {
            type: PropertyTypeN.REFERENCE_ENTITY, entity: {
                deepPath: "/Inventory/Product",
                copiedProperties: [
                    "code",
                    "name",
                    "price",
                    "currency_code",
                ]
            }
        },
        location: { type: PropertyTypeN.STRING, allowNull: false },
        serial1: { type: PropertyTypeN.STRING },
        serial2: { type: PropertyTypeN.STRING },
        serial3: { type: PropertyTypeN.STRING },
        serial4: { type: PropertyTypeN.STRING },
        serial5: { type: PropertyTypeN.STRING },
        serial6: { type: PropertyTypeN.STRING },
        serial7: { type: PropertyTypeN.STRING },
        install_date: { type: PropertyTypeN.DATETIME },
        state: { type: PropertyTypeN.STRING, allowNull: false },
        nb_piston_cycles: { type: PropertyTypeN.STRING },
        brita_counter: { type: PropertyTypeN.STRING },
        washing_cycles: { type: PropertyTypeN.STRING, }
    }
};
