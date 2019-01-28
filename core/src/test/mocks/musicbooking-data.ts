/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const Srv_01 = {_id: "MBK__Service~~01", category: "Orchestra-Strings", name: "Violin", unitType: 'Hours', unitPrice: '75'};
const Srv_02 = {_id: "MBK__Service~~02", category: "Orchestra-Strings", name: "Viola", unitType: 'Hours', unitPrice: '75'};
const Srv_03 = {_id: "MBK__Service~~03", category: "Orchestra-Strings", name: "Cello", unitType: 'Hours', unitPrice: '75'};
const Srv_04 = {_id: "MBK__Service~~04", category: "Orchestra-Strings", name: "Bass", unitType: 'Hours', unitPrice: '75'};
const Srv_05 = {_id: "MBK__Service~~05", category: "Orchestra-Strings", name: "Harp", unitType: 'Hours', unitPrice: '75'};
const Srv_06 = {_id: "MBK__Service~~06", category: "Orchestra-Strings", name: "Solo Strings", unitType: 'Hours', unitPrice: '75'};
const Srv_07 = {_id: "MBK__Service~~07", category: "Orchestra-Strings", name: "Chorus", unitType: 'Hours', unitPrice: '75'};
const Srv_08 = {_id: "MBK__Service~~08", category: "Woodwinds", name: "Flute", unitType: 'Hours', unitPrice: '75'};
const Srv_09 = {_id: "MBK__Service~~09", category: "Woodwinds", name: "Clarinet ", unitType: 'Hours', unitPrice: '75'};
const Srv_10 = {_id: "MBK__Service~~10", category: "Woodwinds", name: "Oboe", unitType: 'Hours', unitPrice: '75'};
const Srv_11 = {_id: "MBK__Service~~11", category: "Woodwinds", name: "Bassoon ", unitType: 'Hours', unitPrice: '75'};
const Srv_12 = {_id: "MBK__Service~~12", category: "Woodwinds", name: "Sax", unitType: 'Hours', unitPrice: '75'};
const Srv_13 = {_id: "MBK__Service~~13", category: "Woodwinds", name: "Solo Woodwinds", unitType: 'Hours', unitPrice: '75'};
const Srv_14 = {_id: "MBK__Service~~14", category: "Woodwinds", name: "Other", unitType: 'Hours', unitPrice: '75'};
const Srv_15 = {_id: "MBK__Service~~15", category: "Brass", name: "French Horn", unitType: 'Hours', unitPrice: '75'};
const Srv_16 = {_id: "MBK__Service~~16", category: "Brass", name: "Trumpet", unitType: 'Hours', unitPrice: '75'};
const Srv_17 = {_id: "MBK__Service~~17", category: "Brass", name: "Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_18 = {_id: "MBK__Service~~18", category: "Brass", name: "Bass Trombone ", unitType: 'Hours', unitPrice: '75'};
const Srv_19 = {_id: "MBK__Service~~19", category: "Brass", name: "Tuba", unitType: 'Hours', unitPrice: '75'};
const Srv_20 = {_id: "MBK__Service~~20", category: "Brass", name: "Solo Brass", unitType: 'Hours', unitPrice: '75'};
const Srv_21 = {_id: "MBK__Service~~21", category: "Brass", name: "Other", unitType: 'Hours', unitPrice: '75'};

const Estimate1 = { _id: "MBK__Estimate~~1", client: "John Doe", totalPlayers: 14, date: "2018-12-29" };
const Estimate1__Srv1 = { _id: "MBK__Estimate__Service~~1__1", service: Srv_01, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv2 = { _id: "MBK__Estimate__Service~~1__2", service: Srv_03, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv3 = { _id: "MBK__Estimate__Service~~1__3", service: Srv_05, musicians: 1, quantity: 10, doubles: 1, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv4 = { _id: "MBK__Estimate__Service~~1__4", service: Srv_08, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv5 = { _id: "MBK__Estimate__Service~~1__5", service: Srv_12, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv6 = { _id: "MBK__Estimate__Service~~1__6", service: Srv_16, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };
const Estimate1__Srv7 = { _id: "MBK__Estimate__Service~~1__7", service: Srv_20, musicians: 1, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate1._id };

const Estimate2 = { _id: "MBK__Estimate~~2", client: "Paul George", date: "2019-01-03" };
const Estimate2__Srv1 = { _id: "MBK__Estimate__Service~~2__1", service: Srv_02, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2__Srv2 = { _id: "MBK__Estimate__Service~~2__2", service: Srv_04, musicians: 2, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2__Srv3 = { _id: "MBK__Estimate__Service~~2__3", service: Srv_09, musicians: 1, quantity: 10, doubles: 1, cartage: 20, estimateId: Estimate2._id };
const Estimate2__Srv4 = { _id: "MBK__Estimate__Service~~2__4", service: Srv_13, musicians: 5, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };
const Estimate2__Srv5 = { _id: "MBK__Estimate__Service~~2__5", service: Srv_17, musicians: 3, quantity: 10, doubles: 2, cartage: 20, estimateId: Estimate2._id };

const Estimate3 = { _id: "MBK__Estimate~~3", client: "Jack Recher", date: "2019-01-04" };
const Estimate3__Srv1 = { _id: "MBK__Estimate__Service~~3__1", service: Srv_01, musicians: 3, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3__Srv2 = { _id: "MBK__Estimate__Service~~3__2", service: Srv_04, musicians: 2, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3__Srv3 = { _id: "MBK__Estimate__Service~~3__3", service: Srv_10, musicians: 2, quantity: 8, doubles: 1, cartage: 20, estimateId: Estimate3._id };
const Estimate3__Srv4 = { _id: "MBK__Estimate__Service~~3__4", service: Srv_14, musicians: 3, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3__Srv5 = { _id: "MBK__Estimate__Service~~3__5", service: Srv_19, musicians: 5, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };
const Estimate3__Srv6 = { _id: "MBK__Estimate__Service~~3__6", service: Srv_21, musicians: 4, quantity: 8, doubles: 2, cartage: 20, estimateId: Estimate3._id };

const Estimate4 = { _id: "MBK__Estimate~~4", client: "Rick Kevlar", date: "2019-01-04" };
const Estimate4__Srv1 = { _id: "MBK__Estimate__Service~~4__1", service: Srv_02, musicians: 3, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4__Srv2 = { _id: "MBK__Estimate__Service~~4__2", service: Srv_03, musicians: 1, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4__Srv3 = { _id: "MBK__Estimate__Service~~4__3", service: Srv_05, musicians: 2, quantity: 12, doubles: 1, cartage: 20, estimateId: Estimate4._id };
const Estimate4__Srv4 = { _id: "MBK__Estimate__Service~~4__4", service: Srv_11, musicians: 3, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4__Srv5 = { _id: "MBK__Estimate__Service~~4__5", service: Srv_12, musicians: 5, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };
const Estimate4__Srv6 = { _id: "MBK__Estimate__Service~~4__6", service: Srv_20, musicians: 4, quantity: 12, doubles: 2, cartage: 20, estimateId: Estimate4._id };


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
    Estimate1__Srv1,
    Estimate1__Srv2,
    Estimate1__Srv3,
    Estimate1__Srv4,
    Estimate1__Srv5,
    Estimate1__Srv6,
    Estimate1__Srv7,
    Estimate2,
    Estimate2__Srv1,
    Estimate2__Srv2,
    Estimate2__Srv3,
    Estimate2__Srv4,
    Estimate2__Srv5,
    Estimate3,
    Estimate3__Srv1,
    Estimate3__Srv2,
    Estimate3__Srv3,
    Estimate3__Srv4,
    Estimate3__Srv5,
    Estimate3__Srv6,
    Estimate4,
    Estimate4__Srv1,
    Estimate4__Srv2,
    Estimate4__Srv3,
    Estimate4__Srv4,
    Estimate4__Srv5,
    Estimate4__Srv6,
];
