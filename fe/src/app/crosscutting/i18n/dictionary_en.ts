import { MusicBooking_en } from "./musicbooking_en";
import { Inventory_en } from "./inventory_en";
import { Reports_en } from "./reports_en";
import { Forms_en } from "./forms_en";
import { General_en } from "./general_en";
import { Financial_en } from "./financial_en";

const defaultDict_en = {
    'Enable-Developer-Mode': 'Enable Developer Mode',
    'Disable-Developer-Mode': 'Disable Developer Mode',

    'add table': "Add Table",
    'add column': "Add Column",

    Financial: 'Financial',
    General:'General',
    client: 'Client',
    code: 'Code',
    username: 'Username',

    'GEN___Currency!rate1!max': 'Maximum rate1 exceeded',
    'items$': 'Items',
};

export const Dictioary_en = {
    ...defaultDict_en,
    ...MusicBooking_en,
    ...Inventory_en,
    ...Reports_en,
    ...Forms_en,
    ...General_en,
    ...Financial_en,
};
