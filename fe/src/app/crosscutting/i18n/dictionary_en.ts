import { MusicBooking_en } from "./musicbooking_en";
import { Inventory_en } from "./inventory_en";
import { Reports_en } from "./reports_en";
import { Forms_en } from "./forms_en";

const defaultDict_en = {
    'Enable-Developer-Mode': 'Enable Developer Mode',
    'Disable-Developer-Mode': 'Disable Developer Mode',

    Financial: 'Financial',
    General:'General',

    'General___Currency!rate1!max': 'Maximum rate1 exceeded',
    'items$': 'Items',
};

export const Dictioary_en = {
    ...defaultDict_en,
    ...MusicBooking_en,
    ...Inventory_en,
    ...Reports_en,
    ...Forms_en,
};
