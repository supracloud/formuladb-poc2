import { MusicBooking_en } from "./musicbooking_en";
import { Inventory_en } from "./inventory_en";
import { Reports_en } from "./reports_en";
import { Forms_en } from "./forms_en";
import { General_en } from "./general_en";
import { Financial_en } from "./financial_en";

const defaultDict_en = {
    'Enable-Developer-Mode': 'Enable Developer Mode',
    'Disable-Developer-Mode': 'Disable Developer Mode',

    "frmdb-ly-spreadsheet": "Spreadsheet",
    "frmdb-ly-admin": "Admin",
    "frmdb-ly-cover": "Cover",
    "frmdb-ly-landing" : "Landing",
    "frmdb-ly-carousel": "Carousel",
    "frmdb-ly-split" : "Split",
    "frmdb-ly-fpattern": "Fpattern",
    "frmdb-ly-zpattern": "Zpattern",
    "frmdb-ly-mosaic" : "Mosaic",
    "frmdb-ly-magazine": "Magazine",
    "frmdb-ly-container-free" : "Container Free",
    "frmdb-ly-horizontal-symetry": "Horizontal symetry",
    "frmdb-ly-radial-symetry": "Radial symetry",
    "frmdb-ly-asymetry": "Asymetry",

    'Friendly': "Friendly",
    'Approachable': "Approachable",
    'Professional': "Professional",
    'Experienced': "Experienced",
    'Upscale': "Upscale",
    'Exclusive': "Exclusive",
    'CuttingEdge': "Cutting Edge",
    'Stylish': "Stylish",
    'HighTech': "High Tech",
    'Powerful': "Powerful",

    'add table': "Add Table",
    'add column': "Add Column",

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
};
