import { MusicBooking_en } from "./musicbooking_en";
import { Inventory_en } from "./inventory_en";
import { Reports_en } from "./reports_en";
import { Forms_en } from "./forms_en";
import { General_en } from "./general_en";
import { Financial_en } from "./financial_en";
import { Booking_en } from "./booking_en";

const defaultDict_en = {
    'Enable-Developer-Mode': 'Enable Developer Mode',
    'Disable-Developer-Mode': 'Disable Developer Mode',

    "ly_spreadsheet": "Spreadsheet",
    "ly_admin": "Admin",
    "ly_form": "Form",
    "ly_cover": "Cover",
    "ly_landing" : "Landing",
    "ly_carousel": "Carousel",
    "ly_split" : "Split",
    "ly_fpattern": "F-Pattern",
    "ly_zpattern": "Z-Pattern",
    "ly_zigzag": "Zig Zag Pattern",
    "ly_cards": "Cards",
    "ly_grid": "Grid",
    "ly_mosaic" : "Mosaic",
    "ly_magazine": "Magazine",
    "ly_container_free" : "Container Free",
    "ly_horizontal_symetry": "Horizontal Symetry",
    "ly_radial_symetry": "Radial symetry",
    "ly_asymetry": "Asymetry",

    'lk_Friendly': "Friendly",
    'lk_Approachable': "Approachable",
    'lk_Professional': "Professional",
    'lk_Experienced': "Experienced",
    'lk_Upscale': "Upscale",
    'lk_Exclusive': "Exclusive",
    'lk_CuttingEdge': "Cutting Edge",
    'lk_Stylish': "Stylish",
    'lk_HighTech': "High Tech",
    'lk_Powerful': "Powerful",

    'add-table': "Add table",
    'add-child-table-to': "Add child table to $PARAM$",
    'add-column-to': "Add column to $PARAM$",
    'add-column': "Add column",
    'del-table': "Delete table",
    'del-column': "Delete column",

    Financial: 'Financial',
    General:'General',
    client: 'Client',
    code: 'Code',
    username: 'Username',

    'GEN__Currency!rate1!max': 'Maximum rate1 exceeded',
    'items': 'Items',
};

export const Dictioary_en = {
    ...defaultDict_en,
    ...MusicBooking_en,
    ...Inventory_en,
    ...Reports_en,
    ...Forms_en,
    ...General_en,
    ...Financial_en,
    ...Booking_en,
};
