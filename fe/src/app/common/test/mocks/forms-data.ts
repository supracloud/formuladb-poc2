import { INV___PRD___Location1, INV___PRD___Location1a, INV___Order1 } from "./inventory-data";

/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

export const FRM___ServiceForm1 = { 
    _id: "FRM___ServiceForm~~1" ,
    client: {code: 'JDO', username: 'John Doe'},
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

let SFU1 = { 
    ...INV___Order1,
    _id: "INV___Order~~1___1", 
    equipment: 'EQPT-12354',
    reported_problem: 'Does not work !',
    found_problem: 'Found the problem....',
    work_description: 'changed some parts and started it again...',
    nb_piston_cycles: 127,
    brita_counter: 7245,
    washing_cycles: 978,
    state: 'PENDING',
    equipment_group: 'Group1',
};

let SFU2 = { 
    ...INV___Order1,
    _id: "INV___Order~~1___2",
    equipment: 'EQPT-67890',
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
    FRM___ServiceForm1,
    SFU1,
    SFU2
];
