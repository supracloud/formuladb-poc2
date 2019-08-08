import { ProductLocation1, ProductLocation1a, InventoryOrder1 } from "../inventory/data";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export const FRM__ServiceForm1 = {
    _id: 'FRM__ServiceForm~~1',
    client_name: 'Koelpin, Zulauf and Kerluke',
    client_email: 'Kory_Bruen85@gmail.com',
    time_of_arrival: '2018-12-31 18:00',
    time_of_departure: '2018-12-31 19:00',
    normal_hours: 1,
    warranty_hours: 0,
    night_hours: 0,
    shipment_cost: 10,
    notes: 'Lorem ipsum notes, lorem ipsum notes',
    technician_code: 'ACR',
    technician2_code: 'SCI',
    client_person: 'Client Person',
    state: 'PENDING',
    nb_installments: 0,
    accommodation: 0,
};

const Equip1 = {
    _id: 'InventoryProduct~~26',
    code: 'EQUIP1', barcode: '40063813339326',
    name: 'Equipment 1',
    category: 'Automotive',
    subcategory: 'architecto',
    description: 'Aut hic rerum explicabo ut illo ipsumtempora quisquam pariatur.',
    long_description: 'A culpa soluta quaerat debitis sed unde dolores nihil. Ipsa labore temporibus quisquam non sed. Minima qui inventore possimus culpa ratione.\n \rQuidem blanditiis magni sint doloribus assumenda. Aut sunt quia libero est vitae facere. Aut sit non blanditiis atque est.\n \rOmnis quia non sed quo explicabo consequatur. Ipsum ea sit qui omnis aut. Impedit ut non illum eos odit ipsam. Earum aut qui tenetur non nesciunt minima similique.'
};
const Equip1Unit1 = {
    _id: 'InventoryProductUnit~~26__1', code: 'EQPT-12354',
    product: {
        _id: Equip1._id,
        code: Equip1.code,
        name: Equip1.name,
    },
    serial1: '12343626245',
};
const Equip1Unit2 = {
    _id: 'InventoryProductUnit~~26__2', code: 'EQPT-12354',
    product: {
        _id: Equip1._id,
        code: Equip1.code,
        name: Equip1.name,
    },
    serial1: '12343626246',
};

const SFU1 = {
    ...InventoryOrder1,
    _id: 'InventoryOrder~~1__1',
    equipment: {
        _id: Equip1Unit1._id,
        code: Equip1Unit1.code,
        product_code: Equip1Unit1.product.code,
        serial1: Equip1Unit1.serial1,
    },
    reported_problem: 'Does not work !',
    found_problem: 'Found the problem....',
    work_description: 'changed some parts and started it again...',
    nb_piston_cycles: 127,
    brita_counter: 7245,
    washing_cycles: 978,
    state: 'PENDING',
    equipment_group: 'Group1',
};

const SFU2 = {
    ...InventoryOrder1,
    _id: 'InventoryOrder~~1__2',
    equipment: {
        _id: Equip1Unit2._id,
        code: Equip1Unit2.code,
        product_code: Equip1Unit2.product.code,
        serial1: Equip1Unit2.serial1,
    },
    reported_problem: 'Switch it on, does nothing',
    found_problem: 'Power supply failure',
    work_description: 'changed power supply and connectors',
    nb_piston_cycles: 223,
    brita_counter: 7245,
    washing_cycles: 978,
    state: 'PENDING',
    equipment_group: 'Group2',
};

export const FormsData = [
    FRM__ServiceForm1,
    Equip1,
    Equip1Unit1,
    SFU1,
    SFU2
];
