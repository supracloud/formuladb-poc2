import { MusicBooking_en } from "./musicbooking_en";

const defaultDict_en = {
    'Enable-Developer-Mode': 'Enable Developer Mode',
    'Disable-Developer-Mode': 'Disable Developer Mode',

    Financial: 'Financial',
    General:'General',
    Inventory:'Inventory',
    Product: 'Product',
    Location: 'Location',
    ProductUnit: 'ProductUnit',
    Receipt: 'Receipt',
    Item: 'Item',
    Order: 'Order',
    Reports: 'Reports',
    DetailedCentralizerReport: 'DetailedCentralizerReport',
    ServiceCentralizerReport: 'ServiceCentralizerReport',
    TestReport1: 'TestReport1',
    Forms: 'Forms',
    ServiceForm: 'ServiceForm',
    
    sales_agent: "Sales Agent",
    creation_date: "Creation Date",

    DeliveryRate: 'Delivery Rate',
    orderNb: 'Nr Comanda',
    externalOrderNb: 'Nr extern Comanda',
    orderCreationDate: 'Data Creare Comanda',
    clientCode: 'Cod Client',
    client: 'Client',
    addressCode: 'Cod Adresa',
    addressName: 'Nume Adresa',
    location: 'Locatie',
    productCode: 'Cod Produs',
    barcode: 'Cod Bare',
    quantity: 'Quantity',
    quantityError: 'Error Quantity',
    price: 'Price',

    'General___Currency!rate1!max': 'Maximum rate1 exceeded',
    'items$': 'Items',
};

export const Dictioary_en = {
    ...defaultDict_en,
    ...MusicBooking_en,
};
