/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

const Srv_01 = {category: "Orchestra-Strings", name: "Violin", unitType: 'Hours', unitPrice: '75'};
const Srv_02 = {category: "Orchestra-Strings", name: "Viola", unitType: 'Hours', unitPrice: '75'};
const Srv_03 = {category: "Orchestra-Strings", name: "Cello", unitType: 'Hours', unitPrice: '75'};
const Srv_04 = {category: "Orchestra-Strings", name: "Bass", unitType: 'Hours', unitPrice: '75'};
const Srv_05 = {category: "Orchestra-Strings", name: "Harp", unitType: 'Hours', unitPrice: '75'};
const Srv_06 = {category: "Orchestra-Strings", name: "Solo Strings", unitType: 'Hours', unitPrice: '75'};
const Srv_07 = {category: "Orchestra-Strings", name: "Chorus", unitType: 'Hours', unitPrice: '75'};
const Srv_08 = {category: "Woodwinds", name: "Flute", unitType: 'Hours', unitPrice: '75'};
const Srv_09 = {category: "Woodwinds", name: "Clarinet ", unitType: 'Hours', unitPrice: '75'};
const Srv_10 = {category: "Woodwinds", name: "Oboe", unitType: 'Hours', unitPrice: '75'};
const Srv_11 = {category: "Woodwinds", name: "Bassoon ", unitType: 'Hours', unitPrice: '75'};
const Srv_12 = {category: "Woodwinds", name: "Sax", unitType: 'Hours', unitPrice: '75'};
const Srv_13 = {category: "Woodwinds", name: "Solo Woodwinds", unitType: 'Hours', unitPrice: '75'};
const Srv_14 = {category: "Woodwinds", name: "Other", unitType: 'Hours', unitPrice: '75'};
const Srv_15 = {category: "Brass", name: "French Horn", unitType: 'Hours', unitPrice: '75'};
const Srv_16 = {category: "Brass", name: "Trumpet", unitType: 'Hours', unitPrice: '75'};
const Srv_17 = {category: "Brass", name: "Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_18 = {category: "Brass", name: "Bass Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_19 = {category: "Brass", name: "Tuba", unitType: 'Hours', unitPrice: '75'};
const Srv_20 = {category: "Brass", name: "Solo Brass", unitType: 'Hours', unitPrice: '75'};
const Srv_21 = {category: "Brass", name: "Other", unitType: 'Hours', unitPrice: '75'};
const Estimate1 = { _id: "MusicBooking___Estimate~~1", client: "John Doe", date: "2018-12-29" };
const Estimate1___Srv1_1 = { _id: "MusicBooking___Estimate___Service~~1___1", estimateId: Estimate1._id, service: {category: "Orchestra-Strings", name: "Violin", unitType: 'Hours', unitPrice: '75'}, musicians: 2, quantity: 10, doubles: 2, cartage: 20 };

export const MusicBookingData = [
    Srv_01,
    Srv_02,
    Srv_03,
    Srv_04,
    Srv_05,
    Srv_06,
    Srv_07,
    Srv_08,
    Srv_09,
    Srv_10,
    Srv_11,
    Srv_12,
    Srv_13,
    Srv_14,
    Srv_15,
    Srv_16,
    Srv_17,
    Srv_18,
    Srv_19,
    Srv_20,
    Srv_21,
    Estimate1,
    Estimate1___Srv1_1,
];
