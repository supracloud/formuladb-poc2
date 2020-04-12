import { KeyValueObj } from "./key_value_obj";

export interface App extends KeyValueObj {
    name: string;
    description: string;
    category: string;
    pages: string[];
    defaultLook: string;
    defaultPrimaryColor: string;
    defaultSecondaryColor: string;
    defaultTheme: string;
}
