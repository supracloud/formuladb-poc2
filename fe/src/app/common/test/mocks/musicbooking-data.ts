/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

const Srv_01 = {_id: "MBK___Service~~01", category: "Orchestra-Strings", name: "Violin", unitType: 'Hours', unitPrice: '75'};
const Srv_02 = {_id: "MBK___Service~~02", category: "Orchestra-Strings", name: "Viola", unitType: 'Hours', unitPrice: '75'};
const Srv_03 = {_id: "MBK___Service~~03", category: "Orchestra-Strings", name: "Cello", unitType: 'Hours', unitPrice: '75'};
const Srv_04 = {_id: "MBK___Service~~04", category: "Orchestra-Strings", name: "Bass", unitType: 'Hours', unitPrice: '75'};
const Srv_05 = {_id: "MBK___Service~~05", category: "Orchestra-Strings", name: "Harp", unitType: 'Hours', unitPrice: '75'};
const Srv_06 = {_id: "MBK___Service~~06", category: "Orchestra-Strings", name: "Solo Strings", unitType: 'Hours', unitPrice: '75'};
const Srv_07 = {_id: "MBK___Service~~07", category: "Orchestra-Strings", name: "Chorus", unitType: 'Hours', unitPrice: '75'};
const Srv_08 = {_id: "MBK___Service~~08", category: "Woodwinds", name: "Flute", unitType: 'Hours', unitPrice: '75'};
const Srv_09 = {_id: "MBK___Service~~09", category: "Woodwinds", name: "Clarinet ", unitType: 'Hours', unitPrice: '75'};
const Srv_10 = {_id: "MBK___Service~~10", category: "Woodwinds", name: "Oboe", unitType: 'Hours', unitPrice: '75'};
const Srv_11 = {_id: "MBK___Service~~11", category: "Woodwinds", name: "Bassoon ", unitType: 'Hours', unitPrice: '75'};
const Srv_12 = {_id: "MBK___Service~~12", category: "Woodwinds", name: "Sax", unitType: 'Hours', unitPrice: '75'};
const Srv_13 = {_id: "MBK___Service~~13", category: "Woodwinds", name: "Solo Woodwinds", unitType: 'Hours', unitPrice: '75'};
const Srv_14 = {_id: "MBK___Service~~14", category: "Woodwinds", name: "Other", unitType: 'Hours', unitPrice: '75'};
const Srv_15 = {_id: "MBK___Service~~15", category: "Brass", name: "French Horn", unitType: 'Hours', unitPrice: '75'};
const Srv_16 = {_id: "MBK___Service~~16", category: "Brass", name: "Trumpet", unitType: 'Hours', unitPrice: '75'};
const Srv_17 = {_id: "MBK___Service~~17", category: "Brass", name: "Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_18 = {_id: "MBK___Service~~18", category: "Brass", name: "Bass Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_19 = {_id: "MBK___Service~~19", category: "Brass", name: "Tuba", unitType: 'Hours', unitPrice: '75'};
const Srv_20 = {_id: "MBK___Service~~20", category: "Brass", name: "Solo Brass", unitType: 'Hours', unitPrice: '75'};
const Srv_21 = {_id: "MBK___Service~~21", category: "Brass", name: "Other", unitType: 'Hours', unitPrice: '75'};

const Estimate1 = { _id: "MBK___Estimate~~1", client: "John Doe", date: "2018-12-29" };
const Estimate1___Srv1 = { _id: "MBK___Estimate___Service~~1___1", service: Srv_01, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv2 = { _id: "MBK___Estimate___Service~~1___2", service: Srv_03, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv3 = { _id: "MBK___Estimate___Service~~1___3", service: Srv_05, musicians: 1, quantity: 10, doubles: 1, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv4 = { _id: "MBK___Estimate___Service~~1___4", service: Srv_08, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv5 = { _id: "MBK___Estimate___Service~~1___5", service: Srv_12, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv6 = { _id: "MBK___Estimate___Service~~1___6", service: Srv_16, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1___Srv7 = { _id: "MBK___Estimate___Service~~1___7", service: Srv_20, musicians: 1, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };

const Estimate2 = { _id: "MBK___Estimate~~2", client: "Paul George", date: "2019-01-03" };
const Estimate2___Srv1 = { _id: "MBK___Estimate___Service~~2___1", service: Srv_02, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2___Srv2 = { _id: "MBK___Estimate___Service~~2___2", service: Srv_04, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2___Srv3 = { _id: "MBK___Estimate___Service~~2___3", service: Srv_09, musicians: 1, quantity: 10, doubles: 1, cartage: 20, estimateId: Estimate2._id };
const Estimate2___Srv4 = { _id: "MBK___Estimate___Service~~2___4", service: Srv_13, musicians: 5, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2___Srv5 = { _id: "MBK___Estimate___Service~~2___5", service: Srv_17, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };

const Estimate3 = { _id: "MBK___Estimate~~3", client: "Jack Recher", date: "2019-01-04" };
const Estimate3___Srv1 = { _id: "MBK___Estimate___Service~~3___1", service: Srv_01, musicians: 3, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3___Srv2 = { _id: "MBK___Estimate___Service~~3___2", service: Srv_04, musicians: 2, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3___Srv3 = { _id: "MBK___Estimate___Service~~3___3", service: Srv_10, musicians: 2, quantity: 8, doubles: 1, cartage: 20, estimateId: Estimate3._id };
const Estimate3___Srv4 = { _id: "MBK___Estimate___Service~~3___4", service: Srv_14, musicians: 3, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3___Srv5 = { _id: "MBK___Estimate___Service~~3___5", service: Srv_19, musicians: 5, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3___Srv6 = { _id: "MBK___Estimate___Service~~3___6", service: Srv_21, musicians: 4, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };

const Estimate4 = { _id: "MBK___Estimate~~4", client: "Rick Kevlar", date: "2019-01-04" };
const Estimate4___Srv1 = { _id: "MBK___Estimate___Service~~4___1", service: Srv_02, musicians: 3, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4___Srv2 = { _id: "MBK___Estimate___Service~~4___2", service: Srv_03, musicians: 1, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4___Srv3 = { _id: "MBK___Estimate___Service~~4___3", service: Srv_05, musicians: 2, quantity: 12, doubles: 1, cartage: 20, estimateId: Estimate4._id };
const Estimate4___Srv4 = { _id: "MBK___Estimate___Service~~4___4", service: Srv_11, musicians: 3, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4___Srv5 = { _id: "MBK___Estimate___Service~~4___5", service: Srv_12, musicians: 5, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4___Srv6 = { _id: "MBK___Estimate___Service~~4___6", service: Srv_20, musicians: 4, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };


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
    Estimate1___Srv1,
    Estimate1___Srv2,
    Estimate1___Srv3,
    Estimate1___Srv4,
    Estimate1___Srv5,
    Estimate1___Srv6,
    Estimate1___Srv7,
    Estimate2,
    Estimate2___Srv1,
    Estimate2___Srv2,
    Estimate2___Srv3,
    Estimate2___Srv4,
    Estimate2___Srv5,
    Estimate3,
    Estimate3___Srv1,
    Estimate3___Srv2,
    Estimate3___Srv3,
    Estimate3___Srv4,
    Estimate3___Srv5,
    Estimate3___Srv6,
    Estimate4,
    Estimate4___Srv1,
    Estimate4___Srv2,
    Estimate4___Srv3,
    Estimate4___Srv4,
    Estimate4___Srv5,
    Estimate4___Srv6,
];
